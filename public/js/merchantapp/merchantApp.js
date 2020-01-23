angular.module('coupinApp', [
  'ngEnvVars.config',
  // 'httpIntercept',
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
  'AnalyticsCtrl',
  'RewardDetailAnalyticsCtrl',
  'HomeCtrl',
  'BaseMCtrl',
  'BillingCtrl',
  'ProfileCtrl',
  'MerchantSrv',
  'AnalyticsSrv',
  'RewardsCtrl',
  'RewardsListCtrl',
  'StorageSrv',
  'CoupinSrv',
  'ConfigSrv',
  'PaymentSrv',
  'RewardsSrv',
  'AuthSrv',
  'UtilSrv'
]).config(function ($httpProvider) {
  $httpProvider.interceptors.push(function ($state, $window, $q) {
    return {
      responseError: function (res) {
        if (res.status === 401 && res.data === 'TokenExpired') {
          localStorage.removeItem('ctk');
          localStorage.removeItem('hasExpired');
          localStorage.removeItem('isMerchant');
          localStorage.removeItem('user');
          localStorage.clear();

          localStorage.setItem('jwt-expired', true);

          $state.go('auth', {});
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

  $transitions.onBefore( {to: 'dashboard.**' }, function(trans) {
    if (!StorageService.isLoggedIn()) {
      return trans.router.stateService.target('auth', trans.targetState().params());
    } else if (StorageService.isLoggedIn() && StorageService.isMerchant() && !UtilService.isDefined($rootScope.user)) {
      $rootScope['user'] = StorageService.getUser();
    }
  });
});
