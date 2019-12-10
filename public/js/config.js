angular.module("ngEnvVars.config", [])
.constant("ENV_VARS", {"apiUrl":"http://localhost:5032/api/v1","payStackId":"pk_test_e34c598056e00361d0ecceefac6299eef29b7e46"});

// angular.module('httpIntercept', ['ngRoute', 'ui.router', 'ui.router.state.events'])
// .config(function ($httpProvider) {
//   $httpProvider.interceptors.push(function ($state, $window, $q) {
//     return {
//       responseError: function (res) {
//         if (res.status === 401 && res.data === 'jwt expired') {
//           // StorageService.clearAll(); not doing this because of cyclic dependencies
//           localStorage.removeItem('ctk');
//           localStorage.removeItem('hasExpired');
//           localStorage.removeItem('isMerchant');
//           localStorage.removeItem('user');
//           localStorage.clear();

//           $state.go('auth', {});
//           $window.location.reload();
//           $q.reject(res);
//         }

//         return $q.reject(res);
//       },
//     }
//   });
// });
