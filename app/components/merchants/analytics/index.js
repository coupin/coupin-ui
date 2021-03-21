import moment from 'moment';
import Lightpick from 'lightpick';

class MerchantAnalytics {
  static bindings() {
    return {
      shouldAccess: '='
    };
  }

  static require() {
    return { };
  }

  constructor(
    $state,
    AnalyticsService,
    UtilService,
  ) {
    'ngInject';

    this.UtilService = UtilService;
    this.$state = $state;
    this.AnalyticsService = AnalyticsService;
  }

  $onInit() {
    this.disableDownload = false;
    const vm = this;
    this.page = 1
    this.stats = {
      active: 0,
      generated: 0,
      redeemed: 0,
    };

    if (this.shouldAccess) {
      this.loadingRewards = true;
      this.loadingStats = true;
      this.radarSeriesValue = [0];
      this.getOverallCoupinStat();
  
      this.picker = new Lightpick({
        field: document.getElementById('datepicker'),
        singleDate: false,
        numberOfMonths: 2,
        onSelect: (start, end) => {
          vm.start = start
          vm.end = end
          localStorage.setItem('startDate', vm.start);
          localStorage.setItem('endDate', vm.end);
          vm.onDatePickerChange()
        }
      });
    
      if (localStorage.getItem('startDate') && localStorage.getItem('endDate')) {
        const start = localStorage.getItem('startDate');
        const end = localStorage.getItem('endDate');
  
        this.picker.setDateRange(moment(start), moment(end));
      } else {
        this.picker.setDateRange(moment().subtract(30, 'day'), moment());
      }
  
  
      this.getRewards(this.start.valueOf(), this.end.valueOf(), this.page);
      this.getStats(this.start.valueOf(), this.end.valueOf());
    }
  }

  goToReward() {
    this.$state.go('dashboard.reward-analytics', { id: this.rewardId }, {});
  }

  onDatePickerChange() {
    if (this.start && this.end) {
      this.loadingRewards = true;
      this.loadingStats = true;
      this.getRewards(this.start.valueOf(), this.end.valueOf(), this.page)
      this.getStats(this.start.valueOf(), this.end.valueOf())
    }
  }

  getStats(start, end) {
    this.AnalyticsService.getStats(start, end)
      .then((res) => {
        this.loadingStats = false;
        this.stats = res.data;
      });
  }

  getRewards(start, end, page) {
    this.AnalyticsService.getRewards(start, end, page)
    .then((res) => {
      this.loadingRewards = false;
      this.rewards = res.data.rewards.map((reward) => {
        return {
          _id: reward._id,
          name: reward.reward.name,
          start: moment(reward.reward.startDate).format('ll'),
          expires: moment(reward.reward.endDate).format('ll'),
          coupins: {
            generated: reward.generatedCoupin,
            redeemed: reward.redeemedCoupin,
          }
        }
      });
    }).catch((err) => {
      this.loadingRewards = false;
      this.rewards = [];
    });
  }

  getOverallCoupinStat() {
    this.AnalyticsService.getOverallCoupinStat()
    .then((res) => {
      var data = res.data;
      var value = ((data.redeemed / data.generated) || 0) * 100;
      this.radarSeriesValue = [parseFloat(value.toFixed(2))];
    });
  }

  getPdf() {
    if (this.disableDownload) {
      this.UtilService.showWarning('Hey!', 'You have a pending download, please try again after it is done');
      return;
    }

    this.disableDownload = true;

    this.AnalyticsService.allRewardPdf(this.start.valueOf(), this.end.valueOf())
    .then((res) => {
      this.UtilService.showInfo('Hey!', 'Your pdf is being generated, download will start when it is ready');

      // eslint-disable-next-line angular/interval-service
      var interval = setInterval(() => {
        this.AnalyticsService.checkPdfStatus(res.data.documentId)
          .then((_res) => {
            if (_res.data.status === 'success') {
              window.open(_res.data.downloadUrl);
              this.UtilService.showSuccess('Hey!', 'Your pdf is ready, download will start soon');
              clearInterval(interval);
            }

            this.disableDownload = false;
          }).catch((err) => {
            clearInterval(interval);
            this.UtilService.showError('Uh oh!', 'There was an error loading your pdf, please try again');
            this.disableDownload = false;
          });
      }, 3000);
    });
  }

  getExcel() {
    if (this.disableDownload) {
      this.UtilService.showWarning('Hey!', 'You have a pending download, please try again after it is done');
      return;
    }

    this.AnalyticsService.getExcel(this.start.valueOf(), this.end.valueOf())
    .then((res) => {
      console.log(res.data);
      this.UtilService.showSuccess('Hey!', 'Your file is being downloaded');
      window.open(window.URL.createObjectURL(res.data));
      this.disableDownload = false;
    }).catch((err) => {
      clearInterval(interval);
      this.UtilService.showError('Uh oh!', 'There was an error loading your report, please try again');
      this.disableDownload = false;
    });
  }
}

export default app => app.component(
  'merchantAnalytics', {
    template: require('./template.html'),
    styles: [
      require('stylesheets/main.scss'),
      require('./style.scss')
    ],
    controller: MerchantAnalytics,
    controllerAs: 'vm',
    bindings: MerchantAnalytics.bindings(),
    require: MerchantAnalytics.require()
  }
);
