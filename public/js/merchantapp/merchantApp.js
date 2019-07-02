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
  'AnalyticsCtrl',
  'HomeCtrl',
  'BaseMCtrl',
  'BillingCtrl',
  'ProfileCtrl',
  'MerchantSrv',
  'RewardsCtrl',
  'RewardsListCtrl',
  'StorageSrv',
  'CoupinSrv',
  'ConfigSrv',
  'PaymentSrv',
  'RewardsSrv',
  'AuthSrv',
  'UtilSrv'
]).run(function($rootScope, $state, $stateParams, $transitions, StorageService, UtilService) {
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
}).directive('cpLineIndicator', function () {
  return {
    restrict: 'E',
    scope: {
      coupinInfo: '=coupins'
    },
    templateUrl: 'views/directives/cp-line-indicator.html',
    link: function (scope, element) {
      var length = element[0].querySelector('#Rectangle_35').width.baseVal.value
      scope.indicatorLevel = length * (scope.coupinInfo.redeemed/scope.coupinInfo.generated);
    }
  };
});
