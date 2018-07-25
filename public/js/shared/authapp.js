angular.module('authapp', [
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
]).constant('config', {
  baseUrl: 'http://localhost:5030/api/v1',
  paystackId: 'pk_test_e34c598056e00361d0ecceefac6299eef29b7e46'
});