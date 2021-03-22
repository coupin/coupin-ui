import ApexCharts from 'apexcharts';

export class CpRewardAnalyticsGenderDistribution {
  constructor($window) {
    'ngInject';
    this.restrict = 'E';
    this.$window = $window;
    this.template = '<div id="gender-distribution"></div>';
    this.scope = {
      data: '=',
    };
    this.require = {};
  }

  link(scope) {
    scope.barChart;

    // IIFE for gender barchart
    (function () {
      var options = {
        chart: {
          height: 350,
          type: 'bar',
          background: '#202125',
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: true,
            dataLabels: {
              position: 'top',
            },
            barHeight: '70%',
          }
        },
        colors: ['#08AEEA', '#15A580', '#E7745A'],
        series: [{
          name: 'Female',
          data: [47, 55]
        }, {
          name: 'Male',
          data: [53, 45]
        }],
        xaxis: {
          categories: ['Generated', 'Redeemed'],
          labels: {
            show: false,
            style: {
              colors: '#fff',
              fontSize: '9px',
              fontFamily: 'Nunito Sans',
              cssClass: 'linechart-yaxis-label'
            },
          },
          axisTicks: { show: false, },
          axisBorder: {
            show: true,
            borderType: 'solid',
            color: 'rgba(231, 233, 237, 0.65)',
          },
        },
        yaxis: {
          labels: {
            show: true,
            style: {
              colors: '#fff',
              fontSize: '11px',
              fontFamily: 'Nunito Sans',
              cssClass: 'linechart-yaxis-label'
            },
          },
          axisBorder: {
            show: true,
            borderType: 'solid',
            color: 'rgba(231, 233, 237, 0.65)',
          },
        },
        legend: {
          show: true,
          offsetY: 10,
          height: 24,
          fontFamily: 'Nunito Sans',
          fontSize: '12px',
          position: 'bottom',
          labels: {
            colors: ['#FFFFFF'],
          },
          markers: {
            radius: 12,
            width: 12,
            height: 12,
          },
        },
        dataLabels: {
          enabled: true,
          formatter: function (val, opts) {
            return val > 0 ? val + '%' : '';
          },
          offsetX: -20,
        },
        grid: {
          xaxis: { lines: { show: false, } },
          yaxis: { lines: { show: false, } },
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
        }
      }

      scope.barChart = new ApexCharts(
        document.querySelector("#gender-distribution"),
        options
      );

      scope.barChart.render();
    })();

    // update the barchart values
    scope.$watch('data', function (val) {
      scope.barChart.updateSeries(val);
    });
  }
}

