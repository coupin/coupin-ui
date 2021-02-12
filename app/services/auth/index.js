export class AuthService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  check(adminData) {
    return this.RequestService.sendRequest('POST', '/admin', { data: adminData }, false);
  }

  changePassword(id, password, encodedString) {
    return this.RequestService.sendRequest(
      'PUT',
      '/auth/password/c',
      { 
        data: {
          id: id,
          password: password,
          encoded: encodedString
        } 
      },
      false
    );
  }

  confirmEncodedString(encodedString) {
    return this.RequestService.sendRequest(
      'PUT',
      '/auth/forgot-password',
      {
        data: {
          encoded: encodedString
        }
      },
      false
    );
  }

  requestPasswordChange (email) {
    const data = {
      mail: email,
    };

    return this.RequestService.sendRequest('POST', '/auth/forgot-password', { data }, false);
  }

  registerMerch(merchantData) {
    return this.RequestService.sendRequest('POST', '/auth/register/m', { data: merchantData }, false);
  }

  signinA(details) {
    return this.RequestService.sendRequest('POST', '/auth/signin/a', { data: details }, false);
  }

  signinM(details) {
    return this.RequestService.sendRequest('POST', '/auth/signin/m', { data: details }, false);
  }
}

export let authService;

export default app => app
  .service('AuthService', AuthService)
  .run($injector => {
    authService = $injector.get('AuthService');
  });
