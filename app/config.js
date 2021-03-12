export default function config(
  $httpProvider
) {
  'ngInject';

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
}
