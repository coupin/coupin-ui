export class AdminRewardService {
  constructor(RequestService, UtilService) {
    'ngInject';

    this.RequestService = RequestService;
    this.UtilService = UtilService;
  }

  getMerchRewards(id, query) {
    let params = {};

    if (this.UtilService.isDefined(query)) {
      params = {
        ...params,
        status: query.status,
        limit: query.limit,
        page: query.page,
      };
    }

    return this.RequestService.sendRequest('GET', `/merchant/${id}/rewards`, { params });
  }

  getMerchRewardsCount(id, query) {
    let params = {};

    if (this.UtilService.isDefined(query)) {
      params = {
        ...params,
        status: query.status,
      };
    }

    return this.RequestService.sendRequest('GET', `/merchant/${id}/rewards/count`, { params });
  }
}

export let adminRewardService;

export default app => app
  .service('AdminRewardService', AdminRewardService)
  .run($injector => {
    adminRewardService = $injector.get('AdminRewardService');
  });
