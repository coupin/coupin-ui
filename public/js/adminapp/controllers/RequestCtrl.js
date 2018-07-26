angular.module('RequestCtrl', []).controller('RequestController', function(
    $scope,
    $alert,
    MerchantService,
    RequestService,
    UtilService
){
    $scope.requests = [];
    $scope.currentRequest = {};
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
    $scope.totalPen = [];
    $scope.totalCom = [];
    $scope.totalDec = [];

    $scope.getRequests = function(status, page) {
        $scope.loading = true;
        $scope.group = status;
        RequestService.getRequests(status).then(function(response){
            // $scope.requests = response.data;
            console.log(response.data);
    
            switch(status) {
                case 'pending':
                    $scope.totalReq = response.data;
                    break;
                case 'accepted':
                    $scope.totalReq = response.data;
                    break;
                case 'rejected':
                    $scope.totalReq = response.data;
                    break;
                case 'completed':
                    $scope.totalReq = response.data;
                    break;
            }
            $scope.loading = false;
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError(err.data);
        });
    }

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

        RequestService.updateStatus($scope.currentRequest.id, data).then(function(data) {
            $scope.loading = false;
            // Send an alert that approval has been successful
            UtilService.showSuccess('Success', `${$scope.currentRequest.name} has been ${$scope.status.display} and email has been sent`);

            // Change it in the data being shown
            $scope.totalReq = $scope.totalReq.filter(function(request) {
                return request.id !== $scope.currentRequest.id;
            });
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError('Activation Failed', err);
        });
    };
});