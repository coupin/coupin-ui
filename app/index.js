import $ from 'jquery';
window.$ = $;
window.jQuery = $;
import angular from 'angular';

angular.lowercase = text => text && text.toLowerCase();

import 'angular-animate';
import uirouter from 'angular-ui-router';
import 'angular-bootstrap';
import 'angular-daterangepicker';
import 'angular-img-cropper';
// import 'angular-motion';
import 'angular-route';
import 'angular-sessionstorage';
import 'angular-strap';
import 'angular-file-upload';
import 'ng-file-upload';
import 'angular-img-crop';

import 'bootstrap';

import {routesConfig} from './routes';

import config from 'config';
import {runBlock} from 'run';

const ENV = '__ENV__';
const VERSION = '__VERSION__';

const app = angular.module('coupinApp', [
  'ngRoute',
  'ngFileUpload',
  'angularFileUpload',
  'ngSessionStorage',
  'ngImgCrop',
  'angular-img-cropper',
  'mgcrea.ngStrap',
  'ngImgCrop',
  uirouter,
  // 'ui.router.state.events',
  'daterangepicker',
])
  .config(routesConfig)
  .config(config)
  .constant('ENV', ENV)
  .constant('VERSION', VERSION)
  .run(runBlock);


/* directive */
import { ShowMore } from './directives/show-more';
import { AllCaps } from './directives/all-caps';
import { CpLineIndicator } from './directives/charts/cp-line-indicator';
import { CpRadarChart } from './directives/charts/cp-radar-chart';
import { CpRewardAnalyticsAgeDistribution } from './directives/charts/cp-reward-analytics-age-distribution';
import { CpRewardAnalyticsGenderDistribution } from './directives/charts/cp-reward-analytics-gender-distribution';
import { CpRewardAnalyticsGeneratedVsRedeemedCoupins } from './directives/charts/cp-reward-analytics-generated-vs-redeemed-coupins';

app
  .directive('showMore', ['$window', $window => new ShowMore($window)])
  .directive('allCaps', ['$window', $window => new AllCaps($window)])
  .directive('cpLineIndicator', ['$window', $window => new CpLineIndicator($window)])
  .directive('cpRadarChart', ['$window', $window => new CpRadarChart($window)])
  .directive('cpRewardAnalyticsAgeDistribution', ['$window', $window => new CpRewardAnalyticsAgeDistribution($window)])
  .directive('cpRewardAnalyticsGenderDistribution', ['$window', $window => new CpRewardAnalyticsGenderDistribution($window)])
  .directive('cpRewardAnalyticsGeneratedVsRedeemedCoupins', ['$window', $window => new CpRewardAnalyticsGeneratedVsRedeemedCoupins($window)]);
/* end of directives */

require('components').default(app);
require('factories').default(app);
require('services').default(app);
