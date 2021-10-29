angular.module('StorageSrv', []).factory('StorageService', [
  'UtilService',
function(
    UtilService
  ) {
    return {
      clearAll: function() {
        localStorage.removeItem('ctk');
        localStorage.removeItem('hasExpired');
        localStorage.removeItem('isMerchant');
        localStorage.removeItem('user');
        localStorage.clear();
      },
      getToken: function() {
        return localStorage.getItem('ctk');
      },
      getUser: function() {
        try {
          return JSON.parse(localStorage.getItem('user'));
        } catch (err) {
          return;
        }
      },
      isExpired: function() {
        return localStorage.getItem('hasExpired') === 'true';
      },
      isLoggedIn: function() {
        return UtilService.isDefined(localStorage.getItem('ctk'));
      },
      isMerchant: function() {
        return UtilService.isDefined(localStorage.getItem('isMerchant'));
      },
      setExpired: function(hasExpired) {
        localStorage.setItem('hasExpired', hasExpired);
      },
      setIsMerchant: function(option) {
        localStorage.setItem('isMerchant', option);
      },
      setToken: function(token) {
        localStorage.setItem('ctk', token);
      },
      setUser: function(user) {
        localStorage.setItem('user', JSON.stringify(user));
      }
    };
  }]);