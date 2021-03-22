export class CpLineIndicator {
  constructor($window) {
    'ngInject';
    this.restrict = 'E';
    this.$window = $window;
    this.scope = {
      coupinInfo: '=coupins'
    };
    this.require = {};
    this.templateUrl = '/cp-line-indicator.html';
  }

  link(scope, element) {
    scope.length = element[0].querySelector('#Rectangle_35').width.baseVal.value;
    scope.indicatorLevel = scope.length * (scope.coupinInfo.redeemed / scope.coupinInfo.generated);

    scope.$watch('coupinInfo.redeemed', function () {
      scope.indicatorLevel = scope.length * (scope.coupinInfo.redeemed / scope.coupinInfo.generated);
    });
  }
}

