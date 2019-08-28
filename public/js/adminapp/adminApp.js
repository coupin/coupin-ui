
angular.module('adminApp', [
  'ngEnvVars.config',
  'ngRoute',
  'ngFileUpload',
  'ui.router',
  'ui.router.state.events',
  'mgcrea.ngStrap',
  'ngImgCrop',
  'angular-img-cropper',
  'ngSessionStorage',
  'adminRoutes',
  'AdminCtrl',
  'AddMerchantCtrl',
  'AddRewardCtrl',
  'FeaturedCtrl',
  'MerchantCtrl',
  'RequestCtrl',
  'SuperAdminCtrl',
  'AdminSrv',
  'AuthSrv',
  'AuthCtrl',
  'MerchantSrv',
  'PaymentSrv',
  'AdminRewardsSrv',
  'RewardsSrv',
  'RewardsCtrl',
  'RequestSrv',
  'StorageSrv',
  'UtilSrv'
]).run(function($rootScope, $state, $stateParams, $transitions, StorageService, UtilService) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $transitions.onBefore({to: 'portal.**'}, function(trans) {
    if (!StorageService.isLoggedIn()) {
      return trans.router.stateService.target('a', trans.targetState().params());
    } else {
      $rootScope['user'] = StorageService.getUser();
      if (!UtilService.isDefined($rootScope.user) || $rootScope.user.role > 1) {
        return trans.router.stateService.target('a', trans.targetState().params());
      }
    }
  });
}); 