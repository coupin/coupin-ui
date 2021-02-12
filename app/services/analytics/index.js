export class AnalyticsService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  getStats(start, end) {
    let params = {};

    if (start & end) {
      params = { ...params, start, end };
    }

    return this.RequestService.sendRequest('GET', '/analytics/get-stats', { params });
  }


  getRewards(start, end, page) {
    const params = { start, end, page };

    return this.RequestService.sendRequest('GET', '/analytics/rewards', { params });
  }


  getOverallCoupinStat(start, end, page) {
    var url = '/analytics/get-coupin-stats';
    return this.RequestService.sendRequest('GET', '/analytics/get-coupin-stats');
  }


  getRewardGenderDistribution(rewardId) {
    return this.RequestService.sendRequest('GET', `/analytics/reward/${rewardId}/gender-distribution`);
  }


  getSingleReward(rewardId) {
    return this.RequestService.sendRequest('GET', `/analytics/reward/${rewardId}`);
  }


  getRewardAgeDistribution(rewardId) {
    return this.RequestService.sendRequest('GET', `/analytics/reward/${rewardId}/age-distribution`);
  }


  getGeneratedRedeemedCoupin(rewardId) {
    return this.RequestService.sendRequest("GET", `/analytics/reward/${rewardId}/generated-redeemed-coupin`);
  }

  allRewardPdf(start, end) {
    const params = { start, end };
    return this.RequestService.sendRequest('GET', '/analytics/pdf/all-rewards', { params });
  }

  singleRewardPdf(id) {
    return this.RequestService.sendRequest('GET', `/analytics/pdf/reward/${id}`)
  }

  checkPdfStatus(documentId) {
    const params = { documentId };
    return this.RequestService.sendRequest('GET', '/pdf/status', { params });
  }

  getExcel(start, end) {
    const params = { start, end };
    return this.RequestService.sendRequest('GET', '/analytics/excel/all-rewards', {
      params,
      responseType: 'blob'
    });
  }
}

export let analyticsService;

export default app => app
  .service('AnalyticsService', AnalyticsService)
  .run($injector => {
    analyticsService = $injector.get('AnalyticsService');
  });
