angular.module('CustomerCtrl', []).controller('CustomerController', function (
    $scope,
    $timeout,
    $state,
    $location,
    CustomerService,
    UtilService
) {
    $scope.customers = [];
    // $scope.customersCount =
    $scope.page = 1;
    $scope.query = ''
    $scope.maxPage = 0;
    $scope.query = '';
    $scope.loading = false;

    $scope.loadCustomers = function () {
        $scope.loading = true;

        CustomerService.getAll($scope.page)
            .then(function (res) {
                $scope.loading = false
                $scope.customers = res.data;
            })
            .catch(function (err) {
                $scope.loading = false
                UtilService.showError('Error', err.data.message);
            })
    }

    $scope.nextPage = function () {
        $scope.page += 1;
        $scope.loadCustomers();
    };

    $scope.previousPage = function () {
        if ($scope.page > 1) {
            $scope.page -= 1;
            $scope.loadCustomers();
        }
    };

    $scope.editCustomer = function(id) {
        $state.go('portal.add-customer', { id })
    }
});



