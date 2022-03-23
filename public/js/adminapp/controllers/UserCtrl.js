angular.module('UserCtrl', []).controller('UserController', function(
    $scope,
    $timeout,
    $state,
    $location,
    UserService,
    UtilService
) {
    $scope.users = [];
    $scope.page = 0;
    $scope.maxPage = 0;
    $scope.query = '';
    $scope.loading = false;

    $scope.loadUsers = function() {
        console.log('hello world')
        $scope.loading = true;
        UserService.test
    }

    
});