angular.module('MerchantCtrl', []).controller('MerchantController', function(
    $alert,
    $scope,
    $timeout,
    $state,
    $location,
    MerchantService,
    Upload,
    UtilService
) {
    var page = 0;
    $scope.loading = false;
    $scope.merchants = [];

    $scope.addMerch = function() {
        $state.go('portal.add-merchs', {});
    };

    $scope.editMerch = function(id) {
        $state.go('portal.add-merchs', {
            id: id
        });
    };

    $scope.loadMerchants = function() {
        $scope.loading = true;
        MerchantService.getAllMerchants(page)
        .then(function (res) {
            $scope.merchants = res.data;
            $timeout(function() {
                $scope.loading = false;
            }, 2000);
        })
        .catch(function (err) {
            $scope.loading = false;
            UtilService.showError('Error', err.data.message);
        });
    };

    $scope.getPageCount = function() {
        const start = page * 10;
        const end = start + $scope.merchants.length;
        return `${start} - ${end}`;
    };

    $scope.previousPage = function() {
        if (page > 0) {
            page--;
            $scope.loadMerchants();
        } else {
            UtilService.showInfo('Uh Oh', 'You are at the beginning.');
        }
    };

    $scope.nextPage = function() {
        if ($scope.merchants.length === 10) {
            page++;
            $scope.loadMerchants();
        } else {
            UtilService.showInfo('Uh Oh', 'There are no more merchants');
        }
    };

    const handleFileSelect = function (evt) {
        let file = evt.currentTarget.files[0];
        let reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function ($scope) {
                $scope.uncropped = evt.target.result;
            });
        };
        reader.readAsDataURL(file);
    };

    angular.element(document.querySelector('#fileInput')).on('change', handleFileSelect);
});