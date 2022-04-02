
angular.module('adminApp', [
  'ngEnvVars.config',
  'ngRoute',
  'ngFileUpload',
  'ui.router',
  'ui.router.state.events',
  'mgcrea.ngStrap',
  // 'ngImgCrop',
  'uiCropper',
  'angular-img-cropper',
  'ngSessionStorage',
  'adminRoutes',
  'AdminCtrl',
  'AddMerchantCtrl',
  'AddRewardCtrl',
  'FeaturedCtrl',
  'ConfigCtrl',
  'CoupinSrv',
  'MerchantCtrl',
  'RequestCtrl',
  'SuperAdminCtrl',
  'AdminSrv',
  'AuthSrv',
  'AuthCtrl',
  'MerchantSrv',
  'PaymentSrv',
  'AdminRewardsSrv',
  'BookingsSrv',
  'RewardsSrv',
  'RewardsCtrl',
  'RequestSrv',
  'ConfigSrv',
  'StorageSrv',
  'UtilSrv',
  'CustomerCtrl',
  'CustomerSrv'
]).config(function ($httpProvider) {
  $httpProvider.interceptors.push(function ($state, $window, $q) {
    return {
      responseError: function (res) {
        if (res.status === 401 && res.data.message === 'TokenExpired') {
          localStorage.removeItem('ctk');
          localStorage.removeItem('hasExpired');
          localStorage.removeItem('isMerchant');
          localStorage.removeItem('user');
          localStorage.clear();

          localStorage.setItem('jwt-expired', true);

          $state.go('a', {});
          $window.location.reload();
          $q.reject(res);
        }

        return $q.reject(res);
      },
    }
  });
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