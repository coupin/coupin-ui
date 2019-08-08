angular.module('AdminCtrl', []).controller('AdminController', function(
    $location,
    $scope,
    $state,
    $window,
    AdminService,
    StorageService,
    UtilService
){
    // form Data
    $scope.newAdminData = {};
    $scope.errorMessages = {};
    // Boolean variables for error or success
    $scope.showError = false;
    $scope.showSuccess = false;

    // Add New Admin
    $scope.addAdmin = function () {
        $scope.errorMessages = {};
        AdminService.create($scope.newAdminData).then(function(data) {
            var response = data.data;
            UtilService.showSuccess('Success!', $scope.newAdminData.email + " was added successfully.");
            $scope.newAdminData = {};
        }).catch(function (err){
            if(err.data.errors) {
                errors = err.data.errors;
                for(var i = 0; i < errors.length; i++) {
                    $scope.errorMessages[errors[i].param] = errors[i].msg;
                }
            } else {   
                UtilService.showError('Uh Oh!', err.data.message);
            }
        });
    };

    // Function to change views
    $scope.changeView = function (view) {
        $location.path(view);
    };

    // Function to log user out
    $scope.logout = function () {
        StorageService.clearAll();
        $state.go('a', {});
    };
});