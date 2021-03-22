import ApexCharts from 'apexcharts';

export class CpRadarChart {
  constructor($window) {
    'ngInject';
    this.restrict = 'E';
    this.$window = $window;
    this.template = '<div id="overall-coupin-stat_radar"></div>';
    this.scope = {
      redeemedValue: '=',
    };
    this.require = {};
  }

  link(scope) {
    /** IIFE for chart by the side */
    scope.barChart;
    (function () {
      var options = {
        chart: {
          type: 'radialBar',
          background: '#202125',
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          radialBar: {
            hollow: {
              size: '77%',
            },
            dataLabels: {
              showOn: 'always',
              name: {
                offsetY: -10,
                show: true,
                color: '#EDEFF2',
                fontSize: '1.25rem'
              },
              value: {
                offsetY: 1,
                color: '#EDEFF2',
                fontSize: '2.5rem',
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
  }
}

