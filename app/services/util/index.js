import Noty from 'noty';

export class UtilService {
  constructor(Upload, apiUrl) {
    'ngInject';

    this.Upload = Upload;
    this.apiUrl = apiUrl;
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

  /**
   * Show error alert dialog.
   * @param {String} title 
   * @param {String} msg 
   */
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
  }

  /**
    * Show error alert dialog.
    * @param {String} title 
    * @param {String} msg 
    */
   showInfo(title, msg) {
    new Noty({
      text: this.getNotificationTemplate(title, msg),
      timeout: 7500,
      closeWith: ['click', 'button'],
      type: 'info'
    }).show();
  }

  /**
   * Show success alert dialog.
   * @param {String} title 
   * @param {String} msg 
   */
  showSuccess(title, msg) {
    new Noty({
      text: this.getNotificationTemplate(title, msg),
      timeout: 7500,
      closeWith: ['click', 'button'],
      type: 'success'
    }).show();
  }

  /**
   * Show warning alert dialog.
   * @param {String} title 
   * @param {String} msg 
   */
  showWarning(title, msg) {
    new Noty({
      text: this.getNotificationTemplate(title, msg),
      timeout: 7500,
      closeWith: ['click', 'button'],
      type: 'warning'
    }).show();
  }

  upload(data) {
    return new Promise(function (resolve, reject) {
      this.Upload.upload({
        url: this.apiUrl('/upload'),
        method: 'POST',
        arrayKey: '',
        data: {
          data: data
        }
      }).then(function (res) {
        resolve(res);
      }).catch(function (error) {
        reject(error);
      });
    });
  };

  fileCheck(x, isLogo) {
    if (this.isDefined(x)) {
      return true;
    } else {
      var msg = isLogo ? 'Please make sure image is at least 200x200 and is at most 2MB.'
        : 'Please make sure image is at least 950x323 and is at most 3MB.';
      this.showError('Invalid Image', msg)
      return false;
    }
  };

  uploadProfile(picture, name, isLogo, cb, pcb) {
    if (fileCheck(picture, isLogo)) {
      var filename = isLogo ? name + '-logo' : name + '-banner';
      this.Upload.upload({
        url: this.apiUrl('/upload'),
        method: 'POST',
        file: picture,
        fields: {
          public_id: filename
        }
      }).then(function (resp) {
        cb({
          success: true,
          data: resp.data
        });
      }, function (err) {
        cb({
          success: false,
          data: err
        });
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        pcb(progressPercentage);
      }).catch(function (err) {
        cb({
          success: false,
          data: err
        });
      });
    } else {
      cb({
        success: false,
        data: {
          data: 'File cannot be empty and must be an image'
        }
      });
    }
  };
}

export let utilService;

export default app => app
  .service('UtilService', UtilService)
  .run($injector => {
    utilService = $injector.get('UtilService');
  });
