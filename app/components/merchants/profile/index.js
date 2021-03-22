/* eslint-disable angular/angularelement */
import moment from 'moment';

class MerchantProfile {
  static bindings() {
    return {};
  }

  static require() {
    return {};
  }

  constructor(
    $scope,
    $q,
    $window,
    StorageService,
    MerchantService,
    UtilService,
    Upload,
    apiUrl
  ) {
    'ngInject';

    this.$scope = $scope;
    this.$q = $q;
    this.StorageService = StorageService;
    this.MerchantService = MerchantService;
    this.UtilService = UtilService;
    this.Upload = Upload;
    this.apiUrl = apiUrl;
    this.$window = $window;
  }

  $onInit() {
    this.loadingPosition = false;
    this.progress = 0;
    this.uploading = false;
    this.updating = false;
    this.editable = false;
    this.updatingPassword = false;
    this.states = ['lagos'];
    this.settings = 'personal';

    if (!this.user) {
      this.user = this.StorageService.getUser();
      this.position = {
        long: this.user.merchantInfo.location[0],
        lat: this.user.merchantInfo.location[1]
      };
    }

    this.position = {
      long: this.user.merchantInfo.location[0],
      lat: this.user.merchantInfo.location[1],
    };

    this.bounds = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    };

    this.image = {
      src: null,
      dst: null,
    };

    this.amount = 0;
    this.bill = false;
    this.isPayAsYouGo = this.user.merchantInfo.billing.plan === 'payAsYouGo';
    this.hasExpired = (this.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter(this.user.merchantInfo.billing.history[0].expiration)) || false;

    this.billing = {
      plan: this.user.merchantInfo.billing.plan,
      reference: null,
      date: new Date(),
    };

    this.history = this.user.merchantInfo.billing.history;

    var logo = this.user.merchantInfo.logo &&
      this.user.merchantInfo.logo.url ?
      this.user.merchantInfo.logo.url :
      '../../../images/logo.jpg';

    var banner = this.user.merchantInfo.banner &&
      this.user.merchantInfo.banner.url ?
      this.user.merchantInfo.banner.url :
      '../../../images/banner_alt.png';

    this.bannerStyle = {
      'background-image': `url("${banner}")`,
    };

    this.logoStyle = {
      'background-image': `url("${logo}")`,
    };
  }

  /**
   * Validate User details
   * @param {Object} user 
   */
  validateUser(user) {
    if (!('email' in user)) {
      this.UtilService.showError('An error occured', 'Email cannot be empty');
      return false;
    } else if (!this.UtilService.isEmail(user.email)) {
      this.UtilService.showError('An error occured', 'Email is invalid');
      return false;
    }

    if ('companyName' in user.merchantInfo && user.merchantInfo.companyName.length === 0) {
      this.UtilService.showError('An error occured', 'Company name cannot be empty');
      return false;
    }

    if ('companyDetails' in user.merchantInfo && user.merchantInfo.companyDetails.length < 15) {
      this.UtilService.showError('An error occured', 'Company details must be more than 15 characters');
      return false;
    }

    if ('mobileNumber' in user.merchantInfo && !this.UtilService.isNumber(user.merchantInfo.mobileNumber)) {
      this.UtilService.showError('An error occured', 'Mobile number is invalid');
      return false;
    }

    if ('address' in user.merchantInfo && user.merchantInfo.address.length < 10) {
      this.UtilService.showError('An error occured', 'Address is too vague. Please put more detail.');
      return false;
    }

    if ('city' in user.merchantInfo && user.merchantInfo.city.length < 3) {
      this.UtilService.showError('An error occured', 'City name is too short. Please try again');
      return false;
    }

    if ('state' in user.merchantInfo && user.merchantInfo.state.length < 3) {
      this.UtilService.showError('An error occured', 'State name is too short. Please try again');
      return false;
    }

    if (this.position && (!('lat' in this.position) || !('long' in this.position))) {
      this.UtilService.showError('An error occured', 'Location must have both latitude and longitude');
      return false;
    }

    return true;
  }

  resetUploads() {
    this.progress = 0;
    this.uploading = false;
  }

  /**
   * CHANGE PASSWORD
   * @param {*} password 
   * @param {*} confirm 
   */
  changePassword(password, confirm) {
    this.updatingPassword = true;
    if (password === confirm) {
      this.MerchantService.changePassword(password).then((response) => {
        this.updatingPassword = false;
        this.UtilService.showSuccess('Success!', 'Password was updated successfully')
        $('#passwordModal').modal('hide');
      }).catch((err) => {
        this.updatingPassword = false;
        if (err.status === 500) {
          this.UtilService.showError('Oops!', 'An Error Occured, Please Try Again');
        } else {
          this.UtilService.showError('oops!', err.data.message);
        }
      });
    } else {
      this.UtilService.showError('Oops', 'The passwords do not match');
    }
  }

  displayRenew() {
    return !isPayAsYouGo && hasExpired;
  }

  fileCheck(x, isLogo) {
    if (this.UtilService.isDefined(x)) {
      this.uploading = true;

      return true;
    } else {
      var msg = isLogo ? 'Please make sure image is at least 200x200 and is at most 2MB.'
        : 'Please make sure image is at least 950x323 and is at most 3MB.';
      this.UtilService.showError('Invalid Image', msg)
      return false;
    }
  }


  setSettings(page) {
    this.settings = page;
  }

  upload(picture, name, isLogo) {
    if (this.fileCheck(picture, isLogo)) {
      this.uploading = true;
      var filename = isLogo ? name + '-logo' : name + '-banner';
      this.Upload.upload({
        url: this.apiUrl('/upload'),
        method: 'POST',
        file: picture,
        fields: {
          public_id: filename
        }
      }).then((resp) => {
        this.uploading = false;
        console.log(resp.data)
        if (isLogo) {
          this.user.merchantInfo.logo = {
            id: resp.data.public_id,
            url: resp.data.secure_url
          };
        } else {
          this.user.merchantInfo.banner = {
            id: resp.data.public_id,
            url: resp.data.secure_url
          };
        }
        $('#cropModal').modal('hide');
        this.update().then(() => {
          setTimeout(() => {
            this.$window.location.reload();
          }, 2000);
        }).catch((err) => {
          console.log(err);
        });
      }, (err) => {
        this.resetUploads();
        this.UtilService.showError('oops!', err.data);
      }, (evt) => {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        this.progress = progressPercentage;
      }).catch((err) => {
        this.resetUploads();
        this.UtilService.showError('oops!', err.data);
      });
    }
  }

  /**
   * Get Merchant's current location
   */
  getLocation(){
    this.loadingPosition = true;
    navigator.geolocation.getCurrentPosition((position) => {
      this.position.lat = position.coords.latitude;
      this.position.long = position.coords.longitude;
      this.loadingPosition = false;
      this.$digest();
    });
  };

  setPlan(plan) {
    this.billing.plan = plan;
    if (plan === 'monthly') {
      amount = 57000;
      bill = true;
    } else if (plan === 'yearly') {
      amount = 750000;
      bill = true;
    } else {
      bill = false;
    }
  };

  showHistory() {
    return this.history.length > 0;
  };

  toggleEditable() {
    this.editable = !this.editable;
  };

  /**
   * Update user profile
   */
  update() {
    if (this.validateUser(this.user)) {
      this.updating = true;
      if (this.position && 'lat' in this.position && 'long' in this.position) {
        this.user.merchantInfo.location = [
          this.position.long,
          this.position.lat
        ];
      }

      const deferred = this.$q.defer();

      this.MerchantService.update(this.user.id, this.user.merchantInfo).then((response) => {
        this.StorageService.setUser(response.data);
        $('#cropModal').modal('hide');
        this.UtilService.showSuccess('Success!', 'Profile updated successfully')
        this.updating = false;
        deferred.resolve();
      }).catch((err) => {
        this.updating = false;
        if (!(err.status === 500) && err.data) {
          this.UtilService.showError('oops!', err.data);
          deferred.reject(err.data);
        } else {
          this.UtilService.showError('Oops!', 'An Error Occured, Please Try Again');
          deferred.reject('An Error Occured, Please Try Again');
        }
      });

      return deferred.promise;
    }
  };

  persistBillingInfo() {
    this.MerchantService.updateBilling(this.user.id, this.billing)
      .then((response) => {
        this.StorageService.setUser(response.data);
        if (this.billing.plan === this.user.merchantInfo.billing.plan) {
          this.UtilService.showSuccess('Success', 'Subscription successfully renewed!');
        } else {
          this.UtilService.showSuccess('Success', `Billing successfully changed to ${this.billing.plan} plan!`);
        }
        $('#billingModal').modal('hide');
        this.StorageService.setExpired(false);
        this.$window.location.reload();
      })
      .catch((err) => {
        this.UtilService.showError('Uh Oh', 'There was an error while updating your billing info. please contact admin on admin@coupin.com');
      });
  }

  validBilling() {
    if (this.isPayAsYouGo && this.billing.plan !== 'payAsYouGo') {
      return true;
    } else if (this.isPayAsYouGo && this.billing.plan === 'payAsYouGo') {
      this.UtilService.showInfo('Hey!', 'Pay As You Go cannot be renewed.');
      return false;
    } else {
      var isValid = moment(new Date()).isBefore(this.user.merchantInfo.billing.history[0].expiration);
      if (isValid) {
        this.UtilService.showInfo('Hey!', 'Your current plan is yet to expire. Please wait for it to expire before renewing.');
        return false;
      } else {
        return true;
      }
    }
  }

  updateBilling(renew) {
    var valid = thvalidBilling();
    if (valid && !renew) {
      if (this.bill) {
        this.makePayment();
      } else {
        this.persistBillingInfo();
      }
    } else {
      thisStorageService.setExpired(false);
      this.$window.location.reload();
      if (valid) {
        this.setPlan(this.user.merchantInfo.billing.plan);
        this.makePayment();
      }
    }
  };

  /**
   * Check file and make upload
   * @param {*} image 
   * @param {*} isLogo 
   */
  uploadImage(image, isLogo) {
    let limit = isLogo ? 500000 : 900000;
    let file;

    if (this.UtilService.isDefined(image.src)) {
      var dataurl = image.dst;
      var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      try {
        file = new File([u8arr], "" + image.src.length, { type: mime });
      } catch (err) {
        file = new Blob([u8arr], { type: mime });
        file.name = "" + image.src.length;
        file.lastModified = new Date();
      }

      if (file.size > limit) {
        limit = limit / 100;
        this.UtilService.showError('Uh Oh!', `File is too large, must be ${temp}KB or less.`);
      } else {
        this.upload(file, this.user.id, isLogo);
      }
    }
  }
}

export default app => app.component(
  'merchantProfile', {
  template: require('./template.html'),
  styles: [
    require('stylesheets/main.scss'),
    require('./style.scss')
  ],
  controller: MerchantProfile,
  controllerAs: 'vm',
  bindings: MerchantProfile.bindings(),
  require: MerchantProfile.require()
}
);
