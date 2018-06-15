angular.module('authapp', [
  'ngRoute',
  'ngFileUpload',
  'ngSessionStorage',
  'ui.router',
  'ui.router.state.events',
  'mgcrea.ngStrap',
  'AuthCtrl',
  'AuthSrv',
  'MerchantSrv',
  'RewardsSrv',
  'StorageSrv',
  'UtilSrv'
]).constant('config', {
  baseUrl: 'http://localhost:5030/api/v1'
});