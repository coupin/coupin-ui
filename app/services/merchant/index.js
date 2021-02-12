export class MerchantService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  changePassword (password) {
    return $http.post(baseV1Url + '/auth/password', { password: password }, {
      headers: getAuthHeader()
    });
  }

  // Complete Registration
  complete(id, data) {
    return this.RequestService.sendRequest('POST', `/merchant/${id}/confirm/`, { data }, false);
  }

  confirm(id) {
    return this.RequestService.sendRequest('GET', `/merchant/${id}/confirm/`, false);
  }

  get() {
    return this.RequestService.sendRequest('GET', '/merchant');
  }

  getAllMerchants(page) {
    return this.RequestService.sendRequest('GET', '/merchant', { params: { page } });
  }

  getAllMerchantsCount() {
    return this.RequestService.sendRequest('GET', '/merchant/count');
  }
  login(data) {
    return this.RequestService.sendRequest('POST', '/auth/signin/m', { data });
  }

  retrieve(id) {
    return this.RequestService.sendRequest('GET', `/merchant/${id}`);
  }

  update(id, data) {
    return this.RequestService.sendRequest('PUT', `/merchant/${id}`, { data });
  }

  updateBilling(id, data) {
    return this.RequestService.sendRequest('POST', '/merchant/' + id, { data });
  }
}

export let merchantService;

export default app => app
  .service('MerchantService', MerchantService)
  .run($injector => {
    merchantService = $injector.get('MerchantService');
  });
