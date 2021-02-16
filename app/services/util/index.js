import Noty from 'noty';

export class UtilService {
  constructor() {
    'ngInject';
  }

  isDecimal(number) {
    if (/^(\-*\+*)\d+\.{1}\d+$/mg.test(number) && number.length >= 8) {
      return true;
    }

    return false;
  }

  isDefined(element) {
    if (!(!!element)) {
      return false;
    } else if (typeof element === 'object' && !(element instanceof Date) && !(element instanceof File) && Object.keys(element).length === 0) {
      return false;
    } else if (Array.isArray(element) && element.length === 0) {
      return false;
    } else if (element === null) {
      return false;
    } else {
      return true;
    }
  }

  isEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  isError(element) {
    return element.$dirty && Object.keys(element.$error).length > 0;
  }

  isFormError(form) {
    return Object.keys(form.$error).length > 0;
  }

  isNumber(number) {
    if (/^\d+$/mg.test(number) && ([11, 13, 14].indexOf(number.length) > -1)) {
      return true;
    }

    return false;
  }

  getNotificationTemplate(title, body) {
    const titleStyle = 'font-weight: bold; text-transform: capitalize; font-size: 17px; margin-bottom: 0;';
    return `<p style="${titleStyle}">${title}</p>
      <div>${body}</div>`;
  }

  showError(title, msg) {
    let text;

    if (!this.isDefined(msg)) {
      text = 'An error occured and error message is not well formatted.';
    } else if (typeof msg === 'object') {
      text = msg.message || msg.error;
    } else {
      text = msg;
    }

    new Noty({
      text: this.getNotificationTemplate(title, text),
      timeout: 5000,
      closeWith: ['click', 'button'],
      type: 'error'
    }).show();
  };
}

export let utilService;

export default app => app
  .service('UtilService', UtilService)
  .run($injector => {
    utilService = $injector.get('UtilService');
  });
