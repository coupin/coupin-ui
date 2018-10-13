angular.module('authapp', [
  'ngEnvVars.config',
  'ngRoute',
  'ngFileUpload',
  'ngSessionStorage',
  'ui.router',
  'ui.router.state.events',
  'angular-img-cropper',
  'ngImgCrop',
  'mgcrea.ngStrap',
  'AuthCtrl',
  'AuthSrv',
  'MerchantSrv',
  'RewardsSrv',
  'StorageSrv',
  'UtilSrv'
]);
