angular.module('BaseMCtrl', []).controller('BaseMController', function (
    $scope,
    $alert,
    StorageService,
    $state
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
            'placement': 'center-center',
            'show' : true ,
            'type' : 'danger'
        });
    };


  $scope.analyticsState = function() {
    return $state.includes('dashboard.analytics') || 
      $state.includes('dashboard.reward-analytics');
  }
});