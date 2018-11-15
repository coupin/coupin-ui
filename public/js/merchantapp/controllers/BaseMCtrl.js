angular.module('BaseMCtrl', []).controller('BaseMController', function (
    $scope,
    $alert,
    $location,
    $state,
    $window,
    StorageService,
    MerchantService,
) {
    $scope.position = {};

    $scope.isExpired = function() {
        return StorageService.isExpired();
    };

    /**
     * Show error alert dialog.
     * @param {String} title 
     * @param {String} msg 
     */
    const showError = function (title, msg) {
        $alert({
            'title': title,
            'content': msg,
            'duration': 5,
            'placement': 'top-right',
            'show' : true ,
            'type' : 'danger'
        });
    };
});