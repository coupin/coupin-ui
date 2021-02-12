export class ConfigService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  getConfig() {
    return this.RequestService.sendRequest('GET', '/config', {}, false);
  }

  setTrialConfig(data) {
    return this.RequestService.sendRequest('PUT', '/config/trial-status', { data: data });
  }  
}

export let configService;

export default app => app
  .service('ConfigService', ConfigService)
  .run($injector => {
    configService = $injector.get('ConfigService');
  });
