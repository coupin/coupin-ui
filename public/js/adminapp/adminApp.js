
angular.module('adminApp', [
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
  'MerchantCtrl',
  'RequestCtrl',
  'SuperAdminCtrl',
  'AdminSrv',
  'AuthSrv',
  'AuthCtrl',
  'MerchantSrv',
  // 'RewardsSrv',
  'RequestSrv',
  'StorageSrv',
  'UtilSrv'
]).constant('config', {
  baseUrl: process.env.API_URL
}).run(function($rootScope, $state, $stateParams, $transitions, StorageService, UtilService) {
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