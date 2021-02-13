export class AdminService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  create(data) {
    return this.RequestService.sendRequest('POST', '/admin', { data });
  }

  // Call to GET admins
  get() {
    return this.RequestService.sendRequest('GET', '/admin');
  }

  getAdmin(id) {
    return this.RequestService.sendRequest('DELETE', `/admin/${id}`);
  }

  getMerchNames(wRewards) {
    var active = wRewards ? true : false;
    return this.RequestService.sendRequest('GET', '/merchant/names', { params: { active } });
  }

  deleteSlide(data) {
    return this.RequestService.sendRequest('PUT', '/admin/hotlist', { data });
  }

  retrieveHotList() {
    return this.RequestService.sendRequest('GET', '/admin/hotlist');
  }

  setHotList(data) {
    return this.RequestService.sendRequest('POST', '/admin/hotlist', { data });
  }

  // Call to DE-Activate admin
  toggleStatus(id) {
    return this.RequestService.sendRequest('PUT', `/admin/${id}`);
  }

  // call to DELETE an admin
  delete(id) {
    return this.RequestService.sendRequest('DELETE', `/admin/${id}`);
  }
}

export let adminService;

export default app => app
  .service('AdminService', AdminService)
  .run($injector => {
    adminService = $injector.get('AdminService');
  });
