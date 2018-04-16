angular.module('RequestCtrl', []).controller('RequestController', function(
    $scope,
    $alert,
    MerchantService,
    RequestService,
    UtilService
){
    $scope.requests = [];
    $scope.currentRequest = {};

    // loading value
    $scope.loading = false;

    // Requests
    $scope.totalReq = [];
    $scope.totalPen = [];
    $scope.totalCom = [];
    $scope.totalDec = [];

    var status = 'pending';

    RequestService.getRequests(status).then(function(response){
        console.log(response);
        $scope.requests = response.data;

        // for(var i = 0; i < $scope.requests.length; i+=1) {
        //     if($scope.requests[i].activated) {
        //         $scope.totalCom.push($scope.requests[i]);
        //     } else if($scope.requests[i].rejected) {
        //         $scope.totalDec.push($scope.requests[i]);
        //     } else if($scope.requests[i].isPending) {
        //         $scope.totalPen.push($scope.requests[i]);
        //     } else {
        //         $scope.totalReq.push($scope.requests[i]);
        //     }
        // }
    });

    $scope.selectMerch = (x) => {
        $scope.currentRequest = $scope.totalReq[x];
    };
    
    $scope.confirm = (id, approve, details) => {
        // Show loading screen and add details for decline
        $scope.loading = true;
        var reason = {
            reason : details
        };

        MerchantService.confirm($scope.currentRequest._id, reason).then(function(data) {
            $scope.loading = false;
            if(data.data.success) {
                if(!data.data.rejected) {
                    // Send an alert that approval has been successful
                    UtilService.showSuccess('Success', `${$scope.currentRequest.companyName} has been accepted and email has been sent`);
                } else {
                    // Send an alert that approval has been successful
                    UtilService.showSuccess('Success', `${$scope.currentRequest.companyName} has been declined and email has been sent`);
                }

                // Change it in the data being shown
                $scope.requests = $scope.requests.filter(function(request) {
                    if(request._id == $scope.currentRequest._id) {
                        if(approve === true) {
                            request.isPending = true;
                        } else {
                            request.rejected = true;
                        }
                    }
                    return request;
                });
            } else {
                // Send an alert that approval failed
                UtilService.showError('Activation Failed', data.data.message);
            }
        }).catch(function(err) {
            $scope.loading = false;
            UtilService.showError('Activation Failed', err);
        });
    };
});