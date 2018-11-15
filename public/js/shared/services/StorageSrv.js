angular.module('StorageSrv', []).factory('StorageService', [
  '$sessionStorage',
  'UtilService',
function(
    $sessionStorage,
    UtilService
  ) {
    return {
      clearAll: function() {
        this.clearToken();
        this.clearUser();
      },
      clearExpired: function() {
        $sessionStorage.remove('hasExpired');
      },
      clearToken: function() {
        $sessionStorage.remove('ctk');
      },
      clearUser: function() {
        $sessionStorage.remove('user');
      },
      getToken: function() {
        return $sessionStorage.get('ctk');
      },
      getUser: function() {
        return $sessionStorage.getObject('user');
      },
      isExpired: function() {
        return $sessionStorage.get('hasExpired') === 'true';
      },
      isLoggedIn: function() {
        return UtilService.isDefined($sessionStorage.get('ctk'));
      },
      setExpired: function(hasExpired) {
        $sessionStorage.put('hasExpired', hasExpired);
      },
      setToken: function(token) {
        $sessionStorage.put('ctk', token);
      },
      setUser: function(user) {
        $sessionStorage.putObject('user', user);
      }
    };
  }]);