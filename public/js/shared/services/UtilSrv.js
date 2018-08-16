angular.module('UtilSrv', []).service('UtilService', [
  '$http',
  '$alert',
  'Upload',
function(
  $http,
  $alert,
  Upload
) {
  var service = {};
  /**
   * Delete photos on cloudinary using their public ids
   * @param {*} urls 
   */
  service.deletePhotos = function(ids) {
    $http.post('/destroy', {
      'data': ids
    }).then(function(res) {
      console.log('Delete attempted');
    }).catch(function(err) {
      console.log('Deleting Failed');
    });
  };

  /**
   * Check if number is decimal
   * @param {String} number 
   */
  service.isDecimal = function(number) {
    if (/^\d\.{1}\d+$/mg.test(number) && number.length >= 8) {
        return true;
    }

    return false;
  };

  /**
   * Check if the element supplied is defined
   * @param {*} element 
   */
  service.isDefined = function(element) {
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

  /**
   * Check if email is valid
   * @param {String} email 
   */
  service.isEmail = function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  /**
   * Check if a Form or any of it's Elements are valid
   * @param {Object} element 
   */
  service.isError = function(element) {
    return element.$dirty && Object.keys(element.$error).length > 0;
  };

  /**
   * Check if a Form is valid
   * @param {Object} form 
   */
  service.isFormError = function(form) {
    return Object.keys(form.$error).length > 0;
  };

  /**
   * Check if mobile nuber is valid
   * @param {String} number 
   */
  service.isNumber = function(number) {
    if (/^\d+$/mg.test(number) && ([11, 13, 14].indexOf(number.length) > -1)) {
        return true;
    }
    
    return false;
  };

  service.payWithPayStack = function(user, plan, amount, cb) {
    var date = new Date();
    var handler = PaystackPop.setup({
      key: 'pk_test_e34c598056e00361d0ecceefac6299eef29b7e46',
      email: user.email,
      amount: amount * 100,
      ref: `${plan}-${user.id}-${date.getTime()}`,
      metadata: {
          custom_fields: [
              {
                  display_name: 'Subscription payment',
                  variable_name: 'Payer\'s Details',
                  value: `Made by ${user.merchantInfo.companyName}`
              }
          ]
      },
      callback: function(response){
          if (cb && typeof cb === 'function') {
              cb(response.reference);
          }
      },
      onClose: function(){
          $scope.loading = false;
          UtilService.showInfo('Payment Cancelled', 'Pay when you are ready.');
      }
  });
  handler.openIframe();
};

  /**
   * Show error alert dialog.
   * @param {String} title 
   * @param {String} msg 
   */
  service.showError = function (title, msg) {
    $alert({
        'title': title,
        'content': msg,
        'duration': 5,
        'placement': 'top-right',
        'show' : true ,
        'type' : 'danger'
    });
  };

   /**
     * Show error alert dialog.
     * @param {String} title 
     * @param {String} msg 
     */
    service.showInfo = function (title, msg) {
      $alert({
          'title': title,
          'content': msg,
          'duration': 5,
          'placement': 'top-right',
          'show' : true ,
          'type' : 'info'
      });
  };

  /**
   * Show success alert dialog.
   * @param {String} title 
   * @param {String} msg 
   */
  service.showSuccess = function (title, msg) {
    $alert({
        'title': title,
        'content': msg,
        'duration': 5,
        'placement': 'top-right',
        'show' : true ,
        'type' : 'success'
    });
  };

  service.upload = function(data) {
    return new Promise(function(resolve, reject) {
      Upload.upload({
        url: '/upload',
        method: 'POST',
        arrayKey: '',
          data: {
              data
          }
      }).then(function(res) {
        resolve(res);
      }).catch(function(error) {
        reject(error);
      });
    });
  };

  function fileCheck(x, isLogo) {
    if (service.isDefined(x)) {
      return true;
    } else {
      var msg = isLogo ? 'Please make sure image is at least 200x200 and is at most 2MB.' 
      : 'Please make sure image is at least 950x323 and is at most 3MB.';
      $alert({
          'title': 'Invalid Image',
          'content': msg,
          'duration': 5,
          'placement': 'top-right',
          'show' : true ,
          'type' : 'danger'
      });
      return false;
    }
  };

  service.uploadProfile = function(picture, name, isLogo, cb, pcb) {
    if (fileCheck(picture, isLogo)) {
      var filename = isLogo ? name + '-logo' : name + '-banner';
      Upload.upload({
          url: '/upload',
          method: 'POST',
          file: picture,
          fields: {
              public_id: filename
          }
      }).then(function(resp) {
        cb({
          success: true, 
          data: resp.data
        });
      }, function(err) {
        cb({
          success: false,
          data: err
        });
      }, function(evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        pcb(progressPercentage);
      }).catch(function(err) {
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

  return service;
}]);