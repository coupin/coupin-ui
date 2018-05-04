angular.module('UtilSrv', []).service('UtilService', [
  '$http',
  '$alert',
  'Upload',
function(
  $http,
  $alert,
  Upload
) {
  /**
   * Delete photos on cloudinary using their public ids
   * @param {*} urls 
   */
  this.deletePhotos = function(ids) {
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
  this.isDecimal = function(number) {
    if (/^\d\.{1}\d+$/mg.test(number) && number.length >= 8) {
        return true;
    }

    return false;
  };

  /**
   * Check if the element supplied is defined
   * @param {*} element 
   */
  this.isDefined = function(element) {
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
  this.isEmail = function(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  /**
   * Check if a Form or any of it's Elements are valid
   * @param {Object} element 
   */
  this.isError = function(element) {
    return element.$dirty && Object.keys(element.$error).length > 0;
  };

  /**
   * Check if mobile nuber is valid
   * @param {String} number 
   */
  this.isNumber = function(number) {
    if (/^\d+$/mg.test(number) && ([11, 13, 14].indexOf(number.length) > -1)) {
        return true;
    }
    
    return false;
  };

  /**
     * Show error alert dialog.
     * @param {String} title 
     * @param {String} msg 
     */
    this.showError = function (title, msg) {
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
    this.showInfo = function (title, msg) {
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
  this.showSuccess = function (title, msg) {
    $alert({
        'title': title,
        'content': msg,
        'duration': 5,
        'placement': 'top-right',
        'show' : true ,
        'type' : 'success'
    });
  };

  this.upload = function(data) {
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
}]);