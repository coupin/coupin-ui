import ApexCharts from 'apexcharts';

export class CpRewardAnalyticsAgeDistribution {
  constructor($window) {
    'ngInject';
    this.restrict = 'E';
    this.$window = $window;
    this.template = '<div id="age-distribution"></div>';
    this.scope = {
      data: '='
    };
    this.require = {};
  }

  link(scope) {
    scope.barChart;

    // IIFE for age column chart
    (function () {
      var options = {
        chart: {
          height: 350,
          type: 'bar',
          background: '#202125',
          stacked: true,
          toolbar: {
            show: false
          }
        },
        plotOptions: {
          bar: {
            horizontal: false,
            dataLabels: {
              position: 'top',
            },
            columnWidth: '55%',
          }
        },
        colors: ['#08AEEA', '#15A580'],
        series: [{
          name: 'Redeemed',
          data: [5, 15, 25, 40, 15]
        }, {
          name: 'Generated',
          data: [15, 36, 24, 17, 8]
        }],
        xaxis: {
          categories: ['45+', '35 - 45', '25 - 35', '15 - 25', 'Below 15'],
          labels: {
            show: true,
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
          enabled: false,
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
        document.querySelector("#age-distribution"),
        options
      );

      scope.barChart.render();
    })()

    // update the barchart values
    scope.$watch('data', function (val) {
      scope.barChart.updateSeries(val);
    });
  }
}

