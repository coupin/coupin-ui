angular.module('StorageSrv', []).factory('StorageService', [
  'UtilService',
function(
    UtilService
  ) {
    return {
      clearAll: function() {
        this.clearToken();
        this.clearUser();
      },
      clearExpired: function() {
        localStorage.clear('hasExpired');
      },
      clearToken: function() {
        localStorage.clear('ctk');
      },
      clearUser: function() {
        localStorage.clear('user');
      },
      getToken: function() {
        return localStorage.getItem('ctk');
      },
      getUser: function() {
        try {
          return JSON.parse(localStorage.getItem('user'));
        } catch {
          return;
        }
      },
      isExpired: function() {
        return localStorage.getItem('hasExpired') === 'true';
      },
      isLoggedIn: function() {
        return UtilService.isDefined(localStorage.getItem('ctk'));
      },
      setExpired: function(hasExpired) {
        localStorage.setItem('hasExpired', hasExpired);
      },
      setToken: function(token) {
        localStorage.setItem('ctk', token);
      },
      setUser: function(user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    };
  }]);