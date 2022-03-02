angular.module('RequestCtrl', []).controller('RequestController', function(
    $scope,
    AdminService,
    CoupinService,
    MerchantService,
    RequestService,
    RewardsService,
    UtilService,
){
    $scope.requests = [];
    $scope.currentRequest = {};
    $scope.currentReward = {};
    $scope.location = {
        lat: 0,
        long: 0
    };
    $scope.notification = {};
    $scope.status = {
        display: 'decline',
        reason: '',
        value: null
    };
    $scope.tab = 'merch';

    // loading value
    $scope.loading = false;
    $scope.sending = false;

    // Requests
    $scope.totalReq = [];
    $scope.totalRewards = [];

    // Coupin 
    $scope.pin = '';
    $scope.empty = false;
    $scope.booking = {};
    $scope.rewards = [];
    $scope.selectedReward = {};
    $scope.requestLoading = false;


    $scope.getDay = function(index) {
        switch(index) {
            case 0:
                return 'Sunday';
            case 1:
                return 'Monday';
            case 2:
                return 'Tuesday';
            case 3:
                return 'Wednesday';
            case 4:
                return 'Thursday';
            case 5:
                return 'Friday';
            case 6:
                return 'Saturday';
        }
    };

    $scope.getRequests = function(status, page) {
        $scope.loading = true;
        $scope.group = status;
        RequestService.getRequests(status).then(function(response) {
            $scope.totalReq = response.data;
            $scope.loading = false;
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError(err.data);
        });
    };

    $scope.getRewards = function() {
        $scope.loading = true;

        RequestService.getRewards().then(function(response) {
            $scope.totalRewards = response.data;
            $scope.loading = false;
        });
    };

    $scope.isError = function(e, type) {
        if (type === 'rating') {
            return e.$error.max;
        } else {
            return false;
        }
    }

    $scope.selectMerch = function (x, status) {
        $scope.currentRequest = x;
        $scope.status.value = status;
        if (status) {
            if (status === 'rejected') {
                $scope.status.display = 'decline';
            } else if (status === 'accepted') {
                $scope.status.display = 'approve';
            } else if (status === 'pending') {
                $scope.status.display = 'de-decline';
            }
        }
    };

    $scope.selectReward = function (x, status) {
        $scope.currentReward = x;
        $scope.status.value = status;
    };

    $scope.canApprove = function() {
        const validate = $scope.status.value === 'rejected' ? 
        $scope.status.reason && $scope.status.reason.length > 10 :
        true;
        return validate;
    };

    $scope.canConfirm = function () {
        if ($scope.status.value === 'pending') {
            return true;
        }

        const validate = $scope.status.value === 'rejected' ?
        ($scope.status.reason && $scope.status.reason.length > 10) :
        ($scope.status.rating < 6 /* && $scope.status.rating > 0 &&
            UtilService.isDecimal($scope.location.lat) && UtilService.isDecimal($scope.location.long) */);
        return validate;
    };

    $scope.isPending = function() {
        return $scope.group === 'pending';
    };

    $scope.isRejected = function() {
        // extra = {
        //     reason: merchant.reason,
        //     isActive: merchant.isActive,
        //     rating: merchant.merchantInfo.rating.value
        // };
        return $scope.group === 'rejected';
    };

    $scope.sendGeneralNotification = function() {
        $scope.sending = true;
        AdminService.sendGeneralNotification($scope.notification).then(function(res) {
            $scope.sending = false;
            UtilService.showSuccess('Success', res.data.message);

            $scope.notification = {};
        }).catch(function(err) {
            $scope.sending = false;
            UtilService.showError('Sending Failed', err.data);
        });
    };

    $scope.sendReview = function() {
        const comment = $scope.status.value === 'accepted' ? 'Good' : $scope.status.reason;
        const status = $scope.status.value === 'accepted' ? 'active' : 'review';
        let data = {
            status: status,
            review : {
                admin: $scope.user.id,
                comment: comment
            }
        };

        $scope.loading = true;
        RewardsService.updateReview($scope.currentReward._id, data).then(function() {
            $scope.loading = false;
            UtilService.showSuccess('Success', $scope.currentReward.name + " has been " + $scope.status.value + " and email has been sent");


            $scope.totalRewards = $scope.totalRewards.filter(function(reward) {
                return reward._id !== $scope.currentReward._id;
            });
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError('Activation Failed', err.data);
        });
    };
    
    $scope.proceed = function() {
        // Show loading screen and add details for decline
        $scope.loading = true;
        let data = {};

        if ($scope.group === 'pending') {
            data = {
                status: $scope.status.value,
                rating: $scope.status.rating,
                reason: $scope.status.reason,
                location: $scope.location
            };
        } else {
            data = {
                status: $scope.status.value
            };
        }

        RequestService.updateStatus($scope.currentRequest.id, data).then(function() {
            $scope.loading = false;
            // Send an alert that approval has been successful
            UtilService.showSuccess('Success', $scope.currentRequest.name + " has been " + $scope.status.value + " and email has been sent");

            // Change it in the data being shown
            $scope.totalReq = $scope.totalReq.filter(function(request) {
                return request.id !== $scope.currentRequest.id;
            });
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError('Activation Failed', err.data);
        });
    };


    // VERIFICATIONS 

    $scope.cannotCancelAll = function() {
        return $scope.rewards.some(reward => reward.status !== 'awaiting_payment' && reward.status !== 'paid');
    };
    $scope.cannotRedeemAll = function() {
        return $scope.rewards.some(reward => reward.status === 'pending')
    };

    $scope.setSelectedReward = function(id) {
      const reward = $scope.rewards.find(booking => booking._id === id);
      $scope.selectedReward.id = reward._id;
      $scope.selectedReward.name = reward.id.name;
      $scope.selectedReward.status = reward.id.status;
    }

    $scope.verify = function(pin) {
      if(!pin) return;
      $scope.loading = true;
      $scope.empty = false;

      CoupinService.verify(pin).then(function(response) {
        $scope.loading = false;
        $scope.booking = response.data;
        $scope.rewards = response.data.rewardId;
      }).catch(function(err) {
          $scope.loading = false;
        if (err.status === 404) {
          $scope.empty = true;
        } else {
            UtilService.showError('Uh Oh', '');
        }
      });
    }

    $scope.redeem = function(id) {
        $scope.requestLoading = true;
        let rewards = $scope.rewards;
        if(id) {
           rewards = $scope.rewards.filter(reward => reward._id === id);
        }
        
        CoupinService.redeem(id, rewards).then(function(response) {
            $('#confirmationAllModal').modal('hide');
            $('#confirmationModal').modal('hide');

            $scope.requestLoading = false;
            $scope.booking = response.data;
            $scope.rewards = response.data.rewardId;
            
            
            
            UtilService.showSuccess('Success', 'Rewards have been successfully updated');            
        }).catch(function(err) {
            $scope.requestLoading = false;
            UtilService.showError('Uh Oh', '');
        });
    }

    $scope.cancel = function(id) {
        $('#confirmationModal').modal('hide');
        $('#confirmationAllModal').modal('hide');
        $scope.requestLoading = true;
        let rewards = $scope.rewards;

        if(id) {
           rewards = $scope.rewards.filter(reward => reward._id === id)
        }

        CoupinService.cancel($scope.booking.id, rewards).then(function(response) {
            $scope.requestLoading = false;
            $scope.booking = response.data;
            $scope.rewards = response.data.rewardId;
            UtilService.showSuccess('Success', 'Rewards have been successfully updated');
        }).catch(function(err) {
            $scope.requestLoading = false;
            UtilService.showError('Uh Oh', '');
        });

    }
});