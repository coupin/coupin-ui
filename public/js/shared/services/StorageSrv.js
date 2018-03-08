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
      isLoggedIn: function() {
        return UtilService.isDefined($sessionStorage.get('ctk'));
      },
      setToken: function(token) {
        $sessionStorage.put('ctk', token);
      },
      setUser: function(user) {
        $sessionStorage.putObject('user', user);
      }
    };
  }]);