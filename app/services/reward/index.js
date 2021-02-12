export class RewardService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  activate(id) {
    return this.RequestService.sendRequest('POST', `/rewards/activate/${id}`, {}, false);
  }

  create(data) {
    return this.RequestService.sendRequest('POST', '/rewards', { data });
  }

  deactivate(id) {
    return this.RequestService.sendRequest('POST', `/rewards/deactivate/${id}`, {}, false);
  }

  delete(id) {
    return this.RequestService.sendRequest('POST', `/rewards/${id}`);
  }

  getMerchRewards(params) {
    return this.RequestService.sendRequest('GET', '/rewards', { params });
  }

  getReward(id) {
    return this.RequestService.sendRequest('GET', `/rewards/ ${id}`);
  }

  update(id, data) {
    return this.RequestService.sendRequest('PUT', `/rewards/${id}`, { data });
  }

  updateReview(id, data) {
    return this.RequestService.sendRequest('POST', `/rewards/status/${id}`, { data });
  }
}

export let rewardService;

export default app => app
  .service('RewardService', RewardService)
  .run($injector => {
    rewardService = $injector.get('RewardService');
  });
