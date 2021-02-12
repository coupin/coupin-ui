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

import {routesConfig} from './routes';

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
  .constant('ENV', ENV)
  .constant('VERSION', VERSION);


/* directive */
import { ShowMore } from './directives/show-more';
import { AllCaps } from './directives/all-caps';

app
  .directive('showMore', ['$window', $window => new ShowMore($window)])
  .directive('allCaps', ['$window', $window => new AllCaps($window)]);
/* end of directives */

require('components').default(app);
require('services').default(app);
require('factories').default(app);
