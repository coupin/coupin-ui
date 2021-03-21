import angular from 'angular';
import moment from 'moment';

class MerchantReward {
  static bindings() {
    return { };
  }

  static require() {
    return { };
  }

  constructor($state, $timeout, PaymentService, MerchantService, RewardService, StorageService, Upload, UtilService, apiUrl) {
    'ngInject';

    this.$state = $state;
    this.$timeout = $timeout;
    this.PaymentService = PaymentService;
    this.MerchantService = MerchantService;
    this.RewardService = RewardService;
    this.StorageService = StorageService;
    this.Upload = Upload;
    this.UtilService = UtilService;
    this.apiUrl = apiUrl;
  }

  $onInit() {
    this.user = this.StorageService.getUser();
    this.expires = (this.user.merchantInfo.billing.history[0] && moment(this.user.merchantInfo.billing.history[0].expiration)) || true;
    this.id = this.$state.params.id;
    this.errTitle = 'Error!';
    this.errMsg = 'Something went wrong on our end. Please try again.';
    this.plan = this.user.merchantInfo.billing.plan;

    this.amount = 0;
    this.showTotal = true;

    // could either be all, weekdays or weekends
    this.selectedDayOption = '';

    this.activeRewards = [];
    this.inactiveRewards = [];
    this.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    this.bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    this.files = [];
    this.image = {
        src: null,
        dst: null
    };
    this.maxDays = 30;

    const cutOffTime = moment().startOf('day').add(23, 'hours').add(30, 'minutes'); // set the date to today 5pm
    if (moment().isBefore(cutOffTime)) {
        this.minDate = new Date();
    } else {
        this.minDate = moment().add(1, 'days').toDate();
    }
    this.photos = [];
    this.deletePhotos = [];
    this.newReward = {
        status: 'draft'
    };
    this.update = false;
    this.loading = false;
    this.uploading = false;

    this.plans = [{
        display: 'Days',
        value: 0
    }, {
        display: 'Weeks',
        value: 1
    }, {
        display: 'Months',
        value: 2
    }, {
        display: 'Years',
        value: 3
    }];

    this.url = window.location.origin;

    if (this.StorageService.isExpired()) {
      this.$state.go('dashboard.rewards', {});
    }

    if (this.user.merchantInfo.billing.plan !== 'payAsYouGo') {
      this.showTotal = false;
      this.maxDays = this.expires.diff(new Date(), 'days');
      this.maxDate = this.expires.toDate();
    } else {
      this.maxDate = moment().add(365, 'day').toDate();
    }

    if (this.id) {
      this.categories = {};
      this.update = true;

      this.RewardService.getReward(this.id).then((result) => {
        this.newReward = result.data;
        this.newReward.endDate = new Date(this.newReward.endDate);
        this.newReward.startDate = new Date(this.newReward.startDate);
        this.setSelectedDayOption();
        this.newReward.categories.forEach((category) => {
          this.categories[category] = true;
        });
        this.newReward.pictures = 'pictures' in this.newReward ? this.newReward.pictures : [];
        this.photos = this.newReward.pictures;
        this.noOfDays = moment(this.newReward.endDate).diff(moment(this.newReward.startDate), 'days');
        this.amount = this.getTotal(this.noOfDays);
      }).catch((error) => {
        this.UtilService.showError(this.errTitle, error);
      });
    } else {
      this.newReward = {
        applicableDays: [],
        categories: [],
        multiple: {},
        pictures: [],
        status: this.showTotal ? 'draft' : 'isPending'
      };
    }
  }

  get isNewReward() {
    return !this.id;
  }

  addCat(category) {
    if (this.newReward.categories.indexOf(category) == -1) {
      this.newReward.categories.push(category);
    } else {
      this.newReward.categories.splice(this.newReward.categories.indexOf(category), 1);
    }
  };

  /**
   * Calculate percentage discount
   * @param {number} oldPrice 
   * @param {number} newPrice 
   */
  calculatePercentage(oldPrice, newPrice) {
    return ((oldPrice - newPrice) / oldPrice) * 100;
  };

  /**
   * Create new reward
   * @param {Object} reward 
   */
  createReward(reward) {
    const bill = this.plan === 'payAsYouGo';
    this.loading = true;
    this.RewardService.create(reward).then((result) => {
      this.newReward = result.data;
      this.loading = false;
      if (this.files.length > 0) {
        this.upload(result.data._id, () => {
          if (bill) {
            this.UtilService.showSuccess('Success', 'Reward Created Successfully as a Draft until payment is complete..');
            this.makePayment(result.data);
          } else {
            this.UtilService.showSuccess('Success', 'Reward Created Successfully. An admin will review it in the next 24hours or less.');
            this.$state.go('dashboard.rewards', {});
          }
        });
      } else if (this.plan === 'payAsYouGo') {
        this.UtilService.showSuccess('Success', 'Reward Created Successfully as a Draft until payment is complete..');
        this.makePayment(result.data);
      } else {
        this.UtilService.showSuccess('Success', 'Reward Created Successfully. An admin will review it in the next 24hours or less.');
        this.$state.go('dashboard.rewards', {});

      }
    }).catch(() => {
      this.loading = false;
      this.UtilService.showError(this.errTitle, this.errMsg);
    });
  };

  setSelectedDayOption() {
    const weekends = [5, 6];

    const isWeekend = this.newReward.applicableDays.length === 2 &&
      this.newReward.applicableDays.every((x) => { return weekends.indexOf(x) > -1; });

    const isWeekday = this.newReward.applicableDays.length === 5 &&
      this.newReward.applicableDays.every((x) => { return !weekends.indexOf(x) > -1; });

    if (this.newReward.applicableDays.length === 7) {
      this.selectedDayOption = 'all';
    } else if (isWeekend) {
      this.selectedDayOption = 'weekends';
    } else if (isWeekday) {
      this.selectedDayOption = 'weekdays';
    } else {
      this.selectedDayOption = '';
    }
  }

  /**
   * Check a particular day of the week
   * @param {String} dayNumber
   */
  day(dayNumber) {

    if (this.newReward.applicableDays.indexOf(dayNumber) !== -1) {
      this.newReward.applicableDays.splice(this.newReward.applicableDays.indexOf(dayNumber), 1);
    } else {
      this.newReward.applicableDays.push(dayNumber)
    }

    this.setSelectedDayOption();
  };

  /**
   * Delete a reward
   * @param {String} id 
   */
  deleteReward(id) {
    this.RewardService.delete(id).then((response) => {
      // $location.url('/merchant');
    }).catch((error) => {
      this.UtilService.showError(this.errTitle, error.data.message);
    });
  };

  /**
   * Display creation button
   */
  displayCreateButton() {
    return !this.update;
  };

  /**
   * Display Pay and Update button
   */
  displayPayAndUpdateButton() {
    return this.update && this.plan === 'payAsYouGo' && this.newReward.status === 'draft';
  };

  /**
   * Display update button
   */
  displayUpdateButton() {
    return this.update && this.newReward.status !== 'draft';
  };

  /**
   * Return boolean to determine whether or not to show reward photos
   */
  displayRewardPhotos() {
    return this.photos.length > 0;
  };

  /**
   * Check file and make upload
   * @param {*} image 
   */
  fileCheck(image) {
    // var limit = 200000;
    var limit = 1000000;
    var file;

    if (this.photos.length === 4) {
      // eslint-disable-next-line angular/angularelement
      $('#croppingModal').modal('hide');
      this.UtilService.showError('Uh Oh!', 'You can only have 4 Reward Pictures at a time.');
    } else if (this.UtilService.isDefined(image.src)) {
      // isuploading = true;
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
        this.UtilService.showError('Uh Oh!', 'File is too large, must be ' + limit + 'KB or less.');
      } else {
        this.files.push(file);
        this.photos.push({
          url: dataurl
        });
        this.image = {
          src: null,
          dst: null
        };
        // eslint-disable-next-line angular/angularelement
        $('#croppingModal').modal('hide');
      }
    }
  };

  /**
   * Get total cost
   * @param {number} days 
   */
  getTotal(days) {
    if (!days) days = 0;
    return parseInt(days, 10) > 7 ? parseInt(days, 10) * 425 : days * 500;
  };

  isError(x) {
    return this.UtilService.isError(x);
  };


  isFormError(x) {
    return this.UtilService.isFormError(x) || this.newReward.applicableDays.length <= 0 || this.newReward.categories.length <= 0;
  };

  /**
   * Make payment for the reward
   * @param {Object} reward 
   */
  makePayment(reward) {
    this.loading = true;
    const rewardId = reward._id || reward.id;
    const paymentObject = {
      callbackUrl: url + '/dashboard/rewards',
      amount: this.amount,
      email: this.user.email,
      type: 'reward',
      companyName: this.user.merchantInfo.companyName,
      userId: this.user.id,
      reward: {
        id: rewardId,
        name: reward.name,
      },
    };

    PaymentService.initiatePayment(paymentObject).then((result) => {
      const authorizationUrl = result.data['authorization_url'];
      this.UtilService.showInfo('Hey!', 'You\'ll be redirected to a payment page to pay for the reward');
      $timeout(() => {
        window.location = authorizationUrl;
      }, 1500)
    });
  };

  get payRewardIsActive() {
    return this.newReward.status !== 'draft' && this.plan === 'payAsYouGo';
  };

  /**
   * Remove images and mark them uploaded
   * images for deletion
   * @param {*} index 
   */
  removeImage(index) {
    if ('id' in this.photos[index]) {
      this.deletePhotos.push(this.photos[index].id);
    }

    this.files.splice(index, 1);
    this.photos.splice(index, 1);
  };

  setEndDate(days) {
    if (!this.showTotal) {
      this.maxDays = this.expires.diff(new Date(this.newReward.startDate), 'days') || 0;
    }
    this.newReward.endDate = moment(this.newReward.startDate).add(days, 'day').toDate();

    this.amount = this.getTotal(days);
  };

  showReviews() {
    return this.newReward.review && this.newReward.review.length > 0 && this.newReward.status === 'review';
  };

  get shouldShowTotal() {
    return this.user.merchantInfo.billing.plan === 'payAsYouGo';
  };

  /**
   * Upload images
   * @param {*} id 
   */
  upload(id, cb) {
    if (this.files.length > 0) {
      this.uploading = true;

      this.Upload.upload({
        url: this.apiUrl('/uploads'),
        method: 'POST',
        arrayKey: '',
        data: {
          photos: this.files,
          public_id: id
        }
      }).then((resp) => {
        this.uploading = false;
        let count = 0;

        resp.data.forEach((data) => {
          const total = this.photos.length;
          let found = false;

          while (count < total && !found) {
            if (this.photos[count].url.indexOf('data') > -1) {
              this.photos[count] = data;
              found = true;
            }
            count++;
          }
        });

        this.newReward.pictures = this.photos;
        this.updateReward(this.newReward);
        if (cb) {
          cb();
        }
      }, () => {
        this.uploading = false;
        this.UtilService.showError('Uh Oh!', 'Your reward images failed to upload. Please try again.');
      }, (evt) => {
        this.progress = parseInt(100.0 * evt.loaded / evt.total);
        // this.progress = progressPercentage;
      }).catch((err) => {
        this.uploading = false;
        this.UtilService.showError('Uh Oh!', 'Your pictures failed to upload. Please try again.')
      });
    }
  };

  /**
   * Update existing reward and
   * replace images if any have been uploaded
   * or deleted
   * @param {*} reward 
   * @param {*} upload 
   */
  updateReward(reward) {
    this.loading = true;
    this.RewardService.update(reward._id, reward).then(() => {
      if (this.deletePhotos.length > 0) {
        this.UtilService.deletePhotos(this.deletePhotos);
      }

      this.UtilService.showSuccess('Success', 'Your Reward updated successfully.');
      this.loading = false;
    }).catch((error) => {
      console.log(error);
      let message = error.message || '';

      if (error && error.data) {
        message = error.data.message;
      }

      this.loading = false;
      this.UtilService.showError('Uh Oh!', message);
    });
  };

  selectGroup(x) {
    if (this.selectedDayOption === x) {
      this.selectedDayOption = '';
      this.newReward.applicableDays = [];
      return;
    }

    this.selectedDayOption = x;

    if (x === 'all') {
      this.newReward.applicableDays = [0, 1, 2, 3, 4, 5, 6];
    } else if (x === 'weekdays') {
      this.newReward.applicableDays = [0, 1, 2, 3, 4];
    } else if (x === 'weekends') {
      this.newReward.applicableDays = [5, 6];
    }
  }

  goToRewardList() {
    this.$state.go('dashboard.rewardsList', {});
  }
}

export default app => app.component(
  'merchantReward', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantReward,
    controllerAs: 'vm',
    bindings: MerchantReward.bindings(),
    require: MerchantReward.require()
  }
);
