angular.module('UtilSrv', []).service('UtilService', function() {
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
   * Check if mobile nuber is valid
   * @param {String} number 
   */
  this.isNumber = function(number) {
    if (/^\d+$/mg.test(number) && ([11, 13, 14].indexOf(number.length) > -1)) {
        return true;
    }
    
    return false;
  };
});