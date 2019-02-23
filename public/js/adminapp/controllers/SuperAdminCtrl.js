angular.module('SuperAdminCtrl', []).controller('SuperAdminController', function(
    $scope,
    $alert,
    AdminService,
    UtilService
) {
    $scope.admins = [];
    $scope.currentAdmin = {};

    // Validation Checks
    $scope.empty = false;
    $scope.error = false;

    var counter = 0;

    AdminService.get().then(function(data) {
        $scope.admins = data.data;
        if($scope.admins.length == 0) {
            $scope.empty = true;
        }
    }).catch(function(err) {
        $scope.errorMessage = err;
        $scope.error = true;
    });

    $scope.toggleStatus = function(id) {
        AdminService.toggleStatus(id)
        .then(function(data) {
            $scope.admins = $scope.admins.filter(function(admin) {
                if(admin._id == $scope.currentAdmin._id) {
                    admin.isActive = !admin.isActive;
                }
                return admin;
            });

            UtilService.showSuccess('Success', data.data.message);
        }).catch(function(err) {
            console.log(err);
            UtilService.showError('Failure', err.data);
        });
    };

    $scope.delete = function(id) {
        AdminService.delete(id)
        .then(function(data) {
            if(data.data.success) {
                $scope.admins = $scope.admins.filter( function(admin) {
                    return admin._id !== $scope.currentAdmin._id;
                });
                $alert({
                    'title': "Success",
                    'content': $scope.currentAdmin.local.email + data.data.message,
                    'duration': 5,
                    'placement': 'center-center',
                    'show' : true ,
                    'type' : 'success'
                });
            }
        }).catch(function(err) {
            UtilService.showError('Failed', err.data.message);
        });
    };

    $scope.selectAdmin = function(x) {
        $scope.currentAdmin = $scope.admins[x];
        $scope.currentAdmin.indexNo = x - 1;
    };
});