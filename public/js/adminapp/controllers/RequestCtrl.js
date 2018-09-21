angular.module('RequestCtrl', []).controller('RequestController', function(
    $scope,
    $alert,
    MerchantService,
    RequestService,
    RewardsService,
    UtilService
){
    $scope.requests = [];
    $scope.currentRequest = {};
    $scope.currentReward = {};
    $scope.location = {
        lat: 0,
        long: 0
    };
    $scope.status = {
        display: 'decline',
        reason: '',
        value: null
    };

    // loading value
    $scope.loading = false;

    // Requests
    $scope.totalReq = [];
    $scope.totalRewards = [];

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

    $scope.selectMerch = (x, status) => {
        $scope.currentRequest = x;
        $scope.status.value = status;
    };

    $scope.selectReward = (x, status) => {
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
        const validate = $scope.status.value === 'rejected' ?
        ($scope.status.reason && $scope.status.reason.length > 10) :
        ($scope.status.rating < 6 && $scope.status.rating > 0 &&
            UtilService.isDecimal($scope.location.lat) && UtilService.isDecimal($scope.location.long));
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
            UtilService.showSuccess('Success', `${$scope.currentReward.name} has been ${$scope.status.value} and email has been sent`);

            $scope.totalRewards = $scope.totalRewards.filter(function(reward) {
                return reward.id !== $scope.currentReward.id;
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
            UtilService.showSuccess('Success', `${$scope.currentRequest.name} has been ${$scope.status.value} and email has been sent`);

            // Change it in the data being shown
            $scope.totalReq = $scope.totalReq.filter(function(request) {
                return request.id !== $scope.currentRequest.id;
            });
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError('Activation Failed', err.data);
        });
    };
});