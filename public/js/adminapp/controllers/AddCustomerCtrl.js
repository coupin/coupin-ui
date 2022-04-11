angular.module('AddCustomerCtrl', []).controller('AddCustomerController', function (
    $scope,
    $state,
    customerId,
    CustomerService,
    UtilService
) {
    let isEdit = false;
    $scope.loading = false;
    $scope.proceeding = false;
    $scope.formData = {}

    if (UtilService.isDefined(customerId)) {
        $scope.loading = true;
        // isEdit = true;
        CustomerService.getOne(customerId)
            .then(function (response) {
                const { customer } = response.data.data
                $scope.formData = { ...customer }
                $scope.loading = false;
            })
            .catch(function (error) {
                const message = error.data.message || 'Sorry, something went wrong. Please try again later'
                UtilService.showError(message)
                $scope.loading = false;
            })
    }

    $scope.proceed = function () {
        if (isEdit) {
            $scope.updateCustomer($scope.formData.id, $scope.formData);
        }
    };

    $scope.updateCustomer = function (id) {
        $scope.proceeding = true;
        CustomerService.update(id, $scope.formData)
            .then(function (response) {
                UtilService.showError('Success', 'Customer updated successfully')
                $scope.proceeding = false;
            })
            .catch(function (error) {
                const message = error.data.message || 'Sorry, something went wrong please try again later'
                UtilService.showError('Error', message)
                $scope.proceeding = false;
            })
    }

    $scope.isEdit = function () {
        return isEdit
    }

    $scope.navigateToList = function () {
        $state.go('portal.view-customers', {});
    };

    $scope.isError = function (element) {
        if (!element) return;
        return UtilService.isError(element);
    };
});