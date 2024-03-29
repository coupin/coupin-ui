angular.module('MerchantCtrl', []).controller('MerchantController', function(
    $scope,
    $timeout,
    $state,
    $location,
    MerchantService,
    Upload,
    UtilService
) {
    $scope.page = 0;
    $scope.maxPage = 0;
    $scope.loading = false;
    $scope.merchants = [];
    $scope.query = '';
    $scope.selectedMerch;
    $scope.selectedMerchAction;

    $scope.addMerch = function() {
        $state.go('portal.add-merchs', {
            id: null
        });
    };

    $scope.editMerch = function(id) {
        $state.go('portal.add-merchs', {
            id: id
        });
    };

    $scope.getPageCount = function() {
        const start = $scope.page * 10;
        const end = start + $scope.merchants.length;
        return start - end;
    };

    $scope.loadMerchants = function() {
        $scope.loading = true;
        MerchantService.getAllMerchants($scope.page, $scope.query)
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

        MerchantService.getAllMerchantsCount($scope.query)
        .then(function (res) {
            $scope.merchantsCount = res.data.count;
            $scope.maxPage = Math.ceil($scope.merchantsCount / 10);
        })
    };

    $scope.nextPage = function() {
        if ($scope.page < ($scope.maxPage - 1)) {
            $scope.page += 1;
            $scope.loadMerchants();
        }
    };

    $scope.previousPage = function() {
        if ($scope.page > 0) {
            $scope.page -= 1;
            $scope.loadMerchants();
        }
    };

    $scope.toggleStatus = function(id) {
        $scope.selectedMerch = $scope.merchants.find(merchant => merchant._id === id);
        $scope.selectedMerchAction  = $scope.selectedMerch.isActive ? 'deactivate' : 'activate'
    };

    $scope.updateVisibility = function(id, action) {
        const merchants = [...$scope.merchants] 
        const idxOfSelectedMerch = merchants.findIndex(merchant => merchant._id === $scope.selectedMerch._id);
        merchants[idxOfSelectedMerch].isActive = !merchants[idxOfSelectedMerch].isActive; 
        
        $scope.merchants = merchants;
        MerchantService.updateMerchantVisibility(id, action)
    }

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