angular.module('coupinApp', [
  'ngRoute',
  'ngSessionStorage',
  'ngImgCrop',
  'angular-img-cropper',
  'mgcrea.ngStrap',
  'ngImgCrop',
  'appRoutes',
  'MainCtrl',
  'AdminCtrl',
  'SuperAdminCtrl',
  'RequestCtrl',
  'WelcomeCtrl',
  'AdminSrv',
  'AuthSrv',
  'RewardsSrv',
  'StorageSrv',
  'CoupinSrv',
  'MerchantSrv',
  'AdminMerchantCtrl',
  'AuthCtrl'
]).constant('config', {
  baseUrl: 'http://localhost:5030/api/v1'
});