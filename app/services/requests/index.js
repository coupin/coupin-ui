export class RequestService {
  constructor(apiUrl, $http, StorageService) {
    'ngInject';

    this.apiUrl = apiUrl;
    this.$http = $http;
    this.StorageService = StorageService;
  }

  setAuthHeader() {
    var token = this.StorageService.getToken();
    return {
        'x-access-token': token
    };
  }

  sendRequest(method = 'GET', path = '/', req = {}, withAuth = true) {
    let headers = {};

    if (withAuth) {
      headers = {
        ...req.headers,
        ...this.setAuthHeader(),
      }
    }

    let apiAddress = this.apiUrl(path);;

    return this.$http({
      method,
      url: apiAddress,
      data: req.data,
      params: req.params,
      responseType: req.responseType || 'json',
      headers
    });
  }
}

export let requestService;

export default app => app
  .service('RequestService', RequestService)
  .run($injector => {
    requestService = $injector.get('RequestService');
  });
