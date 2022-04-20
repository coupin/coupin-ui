angular.module('CustomerCtrl', []).controller('CustomerController', function (
    $scope,
    $timeout,
    $state,
    $location,
    CustomerService,
    UtilService
) {
    $scope.customers = [];
    $scope.total = 0;
    $scope.page = 1;
    $scope.query = ''
    $scope.maxPage = 0;
    $scope.query = '';
    $scope.loading = false;
    $scope.processing = false;

    $scope.loadCustomers = function () {
        $scope.loading = true;

        CustomerService.getAll($scope.page)
            .then(function (res) {
                $scope.loading = false
                $scope.customers = res.data.data.customers;
                $scope.total = res.data.data.total;
                $scope.maxPage = Math.ceil($scope.total / 15);
            })
            .catch(function (err) {
                $scope.loading = false
                UtilService.showError('Error', err.data.message);
            })
    }

    $scope.nextPage = function () {
        if ($scope.page < ($scope.maxPage - 1)) {
            $scope.page += 1;
            $scope.loadCustomers();
        }
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

    $scope.downloadReport = function() {
        $scope.processing = true;

        CustomerService.downloadReport()
        .then(function(response) {
            $scope.processing = false;
            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));

            const link = document.createElement('a');
            link.href = url;
            link.download = 'coupin_customer_report.xlsx';
            link.dispatchEvent(
                new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                })
            )
        })
        .catch(function() {
            const message = 'Sorry, something went wrong'
            $scope.processing = false
            UtilService.showError('Error', message);
        })
    }
});



