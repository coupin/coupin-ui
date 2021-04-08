import moment from 'moment';

class MerchantAuth {
  static bindings() {
    return {};
  }

  static require() {
    return {};
  }

  constructor(
    $scope,
    $window,
    $state,
    $location,
    $timeout,
    MerchantService,
    AuthService,
    StorageService,
    PaymentService,
    UtilService,
    ConfigService,
  ) {
    'ngInject';

    this.$scope = $scope;
    this.$window = $window;
    this.$state = $state;
    this.$timeout = $timeout;
    this.$location = $location;
    this.MerchantService = MerchantService;
    this.AuthService = AuthService;
    this.StorageService = StorageService;
    this.PaymentService = PaymentService;
    this.UtilService = UtilService;
    this.ConfigService = ConfigService;
  }

  $onInit() {
    this.formData = {};
    this.activeView = 'register',
      this.loading = [false, false];
    this.showSessionExpired = false;
    this.plan = 'payAsYouGo';
    this.amount = 0;
    this.confirmed = false;
    this.checkAuth = true;
    this.merchId = '';
    this.encodedString = '';
    this.trialPeriodData = {};
    this.url = window.location.origin;
    this.planIndex = 0;
    this.progress = 0;
    this.showError = false;
    this.uploadingBanner = false;
    this.uploadingLogo = false;
    this.showBilling = false;
    this.multipleAlerts = [];

    this.bounds = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    };

    this.image = {
      src: null,
      dst: null
    };

    this.states = ['Abuja', 'Lagos', 'Rivers State'];

    this.categories = {
      foodndrinks: false,
      shopping: false,
      entertainment: false,
      healthnbeauty: false,
      technology: false,
      groceries: false,
      tickets: false,
      travel: false
    };

    this.strings = this.$location.absUrl().match(/\w+/g);

    this.isJwtExpired();
    this.getCurrentmerchant();
    this.handleForgotPassword();
    this.handleIsAuthenticated();
  }

  isJwtExpired() {
    if (localStorage.getItem('jwt-expired')) {
      this.showSessionExpired = true;

      this.$timeout(() => {
        localStorage.removeItem('jwt-expired');
      }, 3000);
    }
  }

  switchActiveView(view) {
    this.activeView = view;
  }

  getCurrentmerchant() {
    // Get current merchant if merchant route called
    if (this.$location.absUrl().indexOf('confirm') > -1) {
      this.checkAuth = false;
      this.merchId = this.strings[this.strings.length - 2];

      this.ConfigService.getConfig().then((res) => {
        const config = res.data;
        this.trialPeriodData = config.trialPeriod || {};

        if (this.trialPeriodData.enabled) {
          this.planIndex = 3;
          this.plan = 'trial';
        }

        this.showBilling = true;
      });

      if (this.merchId && this.merchId.length === 24) {
        this.MerchantService.confirm(merchId).then((response) => {
          this.user = response.data;
        }).catch((err) => {
          console.log(err);
          this.showErrors('Retrieval Failed', err.data);
        });
      } else {
        this.UtilService.showError('Uh Oh', 'Invalid id.');
      }
    }
  }

  handleForgotPassword() {
    // Confirm Id if for change of password
    if (this.$location.absUrl().indexOf('forgot-password') > -1) {
      this.checkAuth = false;
      const encodedString = this.UtilService.getQueryVariable('query');

      this.AuthService.confirmEncodedString(encodedString)
        .then((result) => {
          this.confirmed = true;
          this.merchId = result.data.id;
        }).catch((err) => {
          if (err.status === 500) {
            this.UtilService.showError('Uh Oh', 'Could not confirm id. Please contact us at care@coupinapp.com');
          } else {
            this.UtilService.showError('Uh Oh', err.data);
          }
        });
    }
  }

  handleIsAuthenticated() {
    if (this.checkAuth && this.StorageService.isLoggedIn()) {
      this.user = this.StorageService.getUser();
      if (this.user.role > 1) {
        this.$state.go('dashboard.home', {});
      } else {
        console.log(this.user.role, 'portal');
        this.$state.go('portal', {});
      }
    }
  }

  /**
   * Add selected category to object
   * @param {Number} x index
   */
  addCat(x) {
    if (this.categories[x] === false) {
      this.categories[x] = true;
    } else {
      this.categories[x] = false;
    }
  }

  setUserInfo(data, setExpiration) {
    if (setExpiration && data.user.merchantInfo.billing.history[0]) {
      const expirationDate = data.user.merchantInfo.billing.history[0].expiration;
      this.StorageService.setExpired(moment(expirationDate).isBefore());
    }
    this.StorageService.setIsMerchant(setExpiration);
    this.StorageService.setToken(data.token);
    this.StorageService.setUser(data.user);
    this.user = data.user;
  }

  signInA() {
    // show loading
    this.loading[0] = true;
    // reset show error back to false
    this.showError = false;

    // only go through if the object has 2 keys
    if (Object.keys(this.formData).length == 2) {
      // check if the login details are correct, if so log in and redirect else show error
      this.AuthService.signinA(this.formData)
        .then((response) => {
          this.setUserInfo(response.data, false);
          this.$state.go('portal.home', {});
        }, (err) => {
          this.loading[0] = false;
          this.loginError = 'Email or Password is invalid.'
          this.showError = true;
        });
    } else {
      this.loading[0] = false;
      this.loginError = 'Email and Password Cannot Be Empty';
      this.showError = true;
    }
  }

  /**
   * Check for plan
   * @param {Number} index 
   */
  planCheck(index) {
    return this.planIndex === index;
  };

  /**
     * Select a plan
     * @param {Number} index 
     */
  planSelect(index) {
    if (index === 0) {
      this.planIndex = 0;
      this.plan = 'payAsYouGo';
    } else if (index === 1) {
      this.planIndex = 1;
      this.amount = 57000;
      this.plan = 'monthly';
    } else if (index === 2) {
      this.planIndex = 2;
      this.amount = 750000;
      this.plan = 'yearly';
    }
  }

  makePayment() {
    const paymentObject = {
      callbackUrl: this.url + '/auth',
      amount: this.amount,
      email: this.user.email,
      type: 'billing',
      billingPlan: this.plan,
      companyName: this.user.merchantInfo.companyName,
      userId: this.user._id,
    };

    this.PaymentService.initiatePayment(paymentObject)
      .then((result) => {
        var authorizationUrl = result.data['authorization_url'];
        this.UtilService.showInfo('Hey!', 'You\'ll be redirected to a payment page to pay for the billing');
        this.$timeout(() => {
          window.location = authorizationUrl;
        }, 3000)
      });
  }

  /**
    * Update user data
    */
  updateUser() {
    this.loading[1] = true;
    return this.MerchantService.complete(this.merchId, this.formData)
  }

  /**
    * Used to complete merchants registration
    */
  completeMerch() {
    if (this.formData.password !== this.formData.password2) {
      this.UtilService.showError('Error', 'Passwords do not match');
      return;
    }

    if (!this.formData.logo || !this.formData.logo.url) {
      this.UtilService.showError('Error', 'Please upload an image for the logo');
      return;
    }

    if (!this.formData.banner || !this.formData.banner.url) {
      this.UtilService.showError('Error', 'Please upload an image for the banner');
      return;
    }

    if (!this.formData.companyDetails) {
      this.UtilService.showError('Error', 'Please add a description for your company');
      return;
    }

    switch (this.planIndex) {
      case 0:
        this.formData['billing'] = {
          plan: plan,
          date: new Date(),
          reference: 'complete-registration'
        };
        this.updateUser().then((data) => {
          var responseMessage = data && data.message || 'success';
          this.UtilService.showSuccess('Confirmation Success', responseMessage);
          this.$window.location.href = '/auth';
        });
        break;
      case 1:
      case 2:
        this.updateUser().then((response) => {
          // Get response data
          let data = response.data;

          // Show loading icon/screen
          this.loading[1] = false;

          // Handle service response
          this.UtilService.showSuccess('Confirmation Success', data.message);
          makePayment();
        }).catch((err) => {
          this.loading[1] = false;
          this.UtilService.showError('Confirmation Failed', 'Your information failed to update, please check connection and try again.');
        });
        break;
      case 3:
        // for the free trial option
        this.formData['billing'] = {
          plan: 'trial',
          date: new Date(),
          reference: this.trialPeriodData.duration + '-months-trial-complete-registration',
          expiration: moment(new Date()).add(this.trialPeriodData.duration, 'months').toDate(),
        };
        this.updateUser().then((response) => {
          // Get response data
          let data = response.data;

          // Show loading icon/screen
          this.loading[1] = false;

          this.UtilService.showSuccess('Confirmation Success', data.message);
          this.$window.location.href = '/auth';
        });
        break;
      default:
        this.UtilService.showError('Please select Valid Plan', 'Please select a valid billing plan!');
    }
  };

  submitPassword() {
    this.loading[1] = true;
    if (this.formData.password === this.formData.password2) {
      this.AuthService.changePassword(this.merchId, this.formData.password, this.encodedString)
        .then((result) => {
          this.UtilService.showSuccess('Success!', 'Password change successful.');
          this.loading[1] = false;
          this.formData = {};
          // $window.location.href="/auth"
        }).catch((err) => {
          this.loading[1] = false;
          this.UtilService.showError('Uh Oh', err.data);
        });
    } else {
      this.loading[1] = false;
      this.UtilService.showError('Uh Oh', 'Passwords do not match. Please try again');
    }
  }

  submitPasswordResetRequest() {
    this.loading[1] = true;
    if (this.formData.resetPasswordEmail) {
      this.AuthService.requestPasswordChange(this.formData.resetPasswordEmail)
        .then((result) => {
          this.UtilService.showSuccess('Success!', 'Request sent successful.');
          this.loading[1] = false;
          this.formData = {};
        }).catch((err) => {
          this.loading[1] = false;
          this.UtilService.showError('Uh Oh', err.data);
        });
    } else {
      this.loading[1] = false;
      this.UtilService.showError('Uh Oh', 'Please enter your email!');
    }
  }

  goToPasswordResetRequestPage() {
    this.$window.location.href = '/auth/request-password-change';
  }

  resetUploads() {
    this.progress = 0;
    this.uploadingLogo = false;
    this.uploadingBanner = false;
  }

  /**
   * Upload image and banner
   * @param {File} image The image.
   * @param {String} name The name of the image being uploaded.
   * @param {Boolean} isLogo true if logo and false if banner.
   */
  upload(image, name, isLogo) {
    if (isLogo) {
      this.uploadingLogo = true;
    } else {
      this.uploadingBanner = true;
    }

    this.UtilService.uploadProfile(image, name, isLogo, (response) => {
      if (response.success) {
        if (isLogo) {
          this.formData['logo'] = {
            id: response.data.public_id,
            url: response.data.secure_url
          };
        } else {
          this.formData['banner'] = {
            id: response.data.public_id,
            url: response.data.secure_url
          };
        }
        angular.element('#cropModal').modal('hide');
        this.resetUploads();
      } else {
        this.UtilService.showError('Upload Failed', response.data);
      }
    }, (percentage) => {
      this.progress = percentage;
    });
  }

  /**
   * Determine whether to show banner or not
   */
  showBanner() {
    return this.UtilService.isDefined(this.formData.banner);
  };

  /**
   * Determine whether to show logo or not
   */
  showLogo() {
    return this.UtilService.isDefined(this.formData.logo);
  };

  /**
   * Check file and make upload
   * @param {*} image 
   * @param {*} isLogo 
   */
  fileCheck(image, isLogo) {
    let limit = isLogo ? 500000 : 900000;
    let file;

    if (this.UtilService.isDefined(image.src)) {
      isuploading = true;
      let dataurl = image.dst;
      let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
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
        this.showError('Uh Oh!', 'File is too large, must be ' + temp + 'KB or less.');
      } else {
        this.upload(file, this.user._id, isLogo);
      }
    }
  };

  /**
   * Logs merchant into the system
   */
  loginMerchant() {
    this.showSessionExpired = false;
    localStorage.removeItem('jwt-expired');
    let details = {
      email: this.formData.loginEmail,
      password: this.formData.loginPassword
    };
    this.loading[0] = true;

    this.AuthService.signinM(details)
      .then((response) => {
        this.setUserInfo(response.data, true);
        this.loading[0] = false;
        this.$state.go('dashboard.home', {});
      }).catch((err) => {
        this.loading[0] = false;
        this.UtilService.showError('Request Failed', err.data);
      });
  }

  setAgreeTermsAndConditionChange() {
    this.agreeTermsAndCondition = !this.agreeTermsAndCondition;
  }

  /**
   * Used to register a merchant after they have been approved
   */
  registerMerchant() {
    // Hide any existing alert
    // hideAllAlerts();

    if (!this.agreeTermsAndCondition) {
      this.UtilService.showError('Missing field', 'Please agree to our terms and conditions');
      return;
    }

    // Get final categories picked
    let finalCat = [];
    for (x in this.categories) {
      if (this.categories[x] === true)
        finalCat[finalCat.length] = x;
    }

    this.formData.categories = finalCat;

    // Show loading icon
    this.loading[1] = true;

    // User service to register merchant
    this.AuthService.registerMerch(this.formData)
      .then((response) => {
        // Hide loading icon
        this.loading[1] = false;

        // Reset form data
        this.formData = {};
        this.categories = {
          foodndrinks: false,
          shopping: false,
          entertainment: false,
          healthnbeauty: false,
          technology: false,
          tickets: false,
          travel: false
        }

        // Send out success alert
        this.UtilService.showSuccess('Success', response.data.message);
      })
      .catch((err) => {
        console.log(err);
        this.loading[1] = false;
        if (err.data.code && err.data.code == 11000) {
          this.UtilService.showError('Request Failed', 'A merchant with that email address already exists.');
        } else {
          this.UtilService.showError('Request Failed', err.data.message);
        }
      });
  };

  /**
   * Used to show errors from the service response
   */
  showErrors(title, response) {
    var data = '';
    if (this.UtilService.isDefined(response.data)) {
      data = response.data.message;
    } else {
      data = 'Error occured while trying to log in';
    }

    // check if errorArray is an object, if so send an alert for each item
    if (typeof data === 'object') {
      for (var i = 0; i < data.length; i++) {
        UtilService.showError(title, data[i].msg)
      }
    } else {
      // else just show the message
      UtilService.showError(title, data);
    }
  };

  logOut() {
    this.StorageService.clearAll();
    this.$state.go('auth', {});
    this.$window.location.reload();
  };

  isError(x) {
    return this.UtilService.isError(x);
  };

  disableMerchantConfirmationButton() {
    if (this.formData.password !== this.formData.password2) {
      return false;
    }

    if (!this.formData.logo || !this.formData.logo.url) {
      return false;
    }

    if (!this.formData.banner || !this.formData.banner.url) {
      return false;
    }

    if (!this.formData.companyDetails) {
      return false;
    }

    return true;
  }
}

export default app => app.component(
  'merchantAuth', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantAuth,
    controllerAs: 'vm',
    bindings: MerchantAuth.bindings(),
    require: MerchantAuth.require()
  }
);
