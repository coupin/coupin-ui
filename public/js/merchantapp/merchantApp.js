angular.module('coupinApp', [
  'ngEnvVars.config',
  'ngRoute',
  'ngFileUpload',
  'ui.router',
  'ui.router.state.events',
  'mgcrea.ngStrap',
  'ngImgCrop',
  'angular-img-cropper',
  'daterangepicker',
  'merchappRoutes',
  'AuthCtrl',
  'HomeCtrl',
  'BaseMCtrl',
  'BillingCtrl',
  'ProfileCtrl',
  'MerchantSrv',
  'RewardsCtrl',
  'RewardsListCtrl',
  'StorageSrv',
  'CoupinSrv',
  'RewardsSrv',
  'AuthSrv',
  'UtilSrv'
]).run(function($rootScope, $state, $stateParams, $transitions, StorageService, UtilService, ENV_VARS) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $transitions.onBefore( {to: 'dashboard.**' }, function(trans) {
    if (!StorageService.isLoggedIn()) {
      return trans.router.stateService.target('auth', trans.targetState().params());
    } else if (StorageService.isLoggedIn() && StorageService.isMerchant() && !UtilService.isDefined($rootScope.user)) {
      $rootScope['user'] = StorageService.getUser();
    }
  });
}).directive('showMore', function () {
  return {
    restrict: 'A',
    link: function (scope, element) {
      element.addClass('shorten');
      element.css('cursor', 'pointer');

      element.on('click', function (event) {
        event.stopImmediatePropagation();
        element.toggleClass('shorten');
      });
    }
  }
})