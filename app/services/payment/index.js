export class PaymentService {
  constructor(RequestService) {
    'ngInject';

    this.RequestService = RequestService
  }

  initiatePayment(data) {
    return this.RequestService.sendRequest('POST', '/initiatepayment', { data });
  }
}

export let paymentService;

export default app => app
  .service('PaymentService', PaymentService)
  .run($injector => {
    paymentService = $injector.get('PaymentService');
  });
