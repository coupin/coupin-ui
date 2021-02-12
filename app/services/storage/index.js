import Util from "../util";

export class StorageService {
  constructor(UtilService) {
    'ngInject';

    this.UtilService = UtilService;
  }

  clearAll() {
    localStorage.removeItem('ctk');
    localStorage.removeItem('hasExpired');
    localStorage.removeItem('isMerchant');
    localStorage.removeItem('user');
    localStorage.clear();
  }

  getToken() {
    return localStorage.getItem('ctk');
  }

  getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch (err) {
      return;
    }
  }

  isExpired() {
    return localStorage.getItem('hasExpired') === 'true';
  }

  isLoggedIn() {
    return this.UtilService.isDefined(localStorage.getItem('ctk'));
  }

  isMerchant() {
    return this.UtilService.isDefined(localStorage.getItem('isMerchant'));
  }

  setExpired(hasExpired) {
    localStorage.setItem('hasExpired', hasExpired);
  }

  setIsMerchant(option) {
    localStorage.setItem('isMerchant', option);
  }

  setToken(token) {
    localStorage.setItem('ctk', token);
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export let storageService;

export default app => app
  .service('StorageService', StorageService)
  .run($injector => {
    storageService = $injector.get('StorageService');
  });
