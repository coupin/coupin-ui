angular.module('coupinApp').directive('showMore', function () {
  return {
    restrict: 'A',
    link: function (scope, element) {
      element.addClass('shorten');
      element.css('cursor', 'pointer');

      element.on('click', function (event) {
        event.stopImmediatePropagation();
        element.toggleClass('shorten');
      });
    }
  }
}).directive('cpLineIndicator', function () {
  return {
    restrict: 'E',
    scope: {
      coupinInfo: '=coupins'
    },
    templateUrl: 'views/directives/cp-line-indicator.html',
    link: function (scope, element) {
      scope.length = element[0].querySelector('#Rectangle_35').width.baseVal.value
      scope.indicatorLevel = scope.length * (scope.coupinInfo.redeemed / scope.coupinInfo.generated);

      scope.$watch('coupinInfo.redeemed', function () {
        scope.indicatorLevel = scope.length * (scope.coupinInfo.redeemed / scope.coupinInfo.generated);
        // element[0].querySelector('#Rectangle_35_animate').beginElement();
      });
    },
  };
}).directive('cpRadarChart', function () {
  return {
    template: '<div id="overall-coupin-stat_radar"></div>',
    restrict: 'E',
    scope: {
      redeemedValue: '=',
    },
    link: function (scope, elem, attr) {
      /** IIFE for chart by the side */
      scope.barChart;
      (function () {
        var options = {
          chart: {
            type: 'radialBar',
            background: '#313237',
          },
          plotOptions: {
            radialBar: {
              hollow: {
                size: '85%',
              },
              dataLabels: {
                showOn: 'always',
                name: {
                  offsetY: -10,
                  show: true,
                  color: '#EDEFF2',
                  fontSize: '17px'
                },
                value: {
                  color: '#EDEFF2',
                  fontSize: '36px',
                  show: true,
                }
              },
              track: {
                background: '#EDEFF2',
              }
            },
          },
          series: [0],
          labels: ['Redeemed'],
          fill: {
            type: 'gradient',
            colors: ['#2AF598'],
            gradient: {
              type: 'horizontal',
              gradientToColors: ['#00A67F'],
              inverseColors: true,
              opacityFrom: 1,
              opacityTo: 1,
              stops: [0, 100]
            }
          },
          stroke: {
            lineCap: 'round'
          },
          colors: ['#2AF598'],
        }

        scope.barChart = new ApexCharts(document.querySelector('#overall-coupin-stat_radar'), options);

        scope.barChart.render();
      })();

      // update the barchart values
      scope.$watch('redeemedValue', function (val) {
        scope.barChart.updateSeries(val);
      });
    },
  };
});