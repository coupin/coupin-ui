export class AllCaps {
  constructor($window) {
    'ngInject';
    this.restrict = 'A';
    this.$window = $window;
    this.scope = {};
    this.require = 'ngModel';
  }

  link(scope, element, attrs, modelCtrl) {
    modelCtrl.$parsers.push(function(value) {
      return value.toUpperCase();
    });

    element.on('blur', function () {
      modelCtrl.$setViewValue(modelCtrl.$modelValue);
      modelCtrl.$render();
    });
  }
}

