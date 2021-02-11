export class AllCaps {
  constructor($window) {
    'ngInject';
    this.restrict = 'A';
    this.$window = $window;
    this.scope = {};
  }

  link(scope, element, atts, ngModel) {
    ngModel.$parsers.push(function(value) {
      return value.toUpperCase();
    });

    element.on('blur', function () {
      ngModel.$setViewValue(ngModel.$modelValue);
      ngModel.$render();
    });
  }
}

