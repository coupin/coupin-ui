export class AdminRequestService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  getRequests(status) {
    return this.RequestService.sendRequest('GET', `/merchant/status/${status}`);
  }

  getRewards() {
    return this.RequestService.sendRequest('GET', '/rewards/requests');
  }

  getMerchantsRewards(id) {
    return this.RequestService.sendRequest('GET', `/merchant/${id}/rewards`);
  }

  // Use to approve or decline
  updateStatus (id, data) {
    return this.RequestService.sendRequest('PUT', `/merchant/${id}/status/`, { data });
  }
}

export let adminRequestService;

export default app => app
  .service('AdminRequestService', AdminRequestService)
  .run($injector => {
    adminRequestService = $injector.get('AdminRequestService');
  });
