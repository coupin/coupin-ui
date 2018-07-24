angular.module('coupinApp', [
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
  'ProfileCtrl',
  'MerchantSrv',
  'RewardsCtrl',
  'RewardsListCtrl',
  'StorageSrv',
  'CoupinSrv',
  'RewardsSrv',
  'AuthSrv',
  'UtilSrv'
]).constant('config', {
  baseUrl: 'https://coupin.herokuapp.com/api/v1',
  paystackId: 'pk_test_e34c598056e00361d0ecceefac6299eef29b7e46'
}).run(function($rootScope, $state, $stateParams, $transitions, StorageService, UtilService) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $transitions.onBefore( {to: 'dashboard.**' }, function(trans) {
    if (!StorageService.isLoggedIn()) {
      return trans.router.stateService.target('auth', trans.targetState().params());
    } else if (StorageService.isLoggedIn() && !UtilService.isDefined($rootScope.user)) {
      $rootScope['user'] = StorageService.getUser();
    }
  });
});