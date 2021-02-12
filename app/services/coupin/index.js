export class CoupinService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  redeem(id, rewards) {
    return this.RequestService.sendRequest('POST', `/coupin/${id}/redeem`, { data: { rewards } });
  }

  verify(pin) {
    return this.RequestService.sendRequest('GET', `/coupin/${pin}/verify`);
  }
}

export let coupinService;

export default app => app
  .service('CoupinService', CoupinService)
  .run($injector => {
    coupinService = $injector.get('CoupinService');
  });
