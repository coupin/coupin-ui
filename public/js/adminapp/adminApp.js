
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
  'AddRewardCtrl',
  'MerchantCtrl',
  'RequestCtrl',
  'SuperAdminCtrl',
  'AdminSrv',
  'AuthSrv',
  'AuthCtrl',
  'MerchantSrv',
  'RewardsSrv',
  'RewardsCtrl',
  'RequestSrv',
  'StorageSrv',
  'UtilSrv'
]).constant('config', {
<<<<<<< HEAD
  baseUrl: 'https://coupin-staging.herokuapp.com/api/v1'
=======
  baseUrl: 'http://localhost:5030/api/v1'
>>>>>>> develop
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