import ApexCharts from 'apexcharts';

export class CpRewardAnalyticsGeneratedVsRedeemedCoupins {
  constructor($window) {
    'ngInject';
    this.restrict = 'E';
    this.$window = $window;
    this.template = '<div id="generated-vs-redeemed"></div>';
    this.scope = {
      data: '=',
      reward: '='
    };
    this.require = {};
  }

  link(scope) {
    scope.lineChart;
    // IIFE for age column chart
    (function () {
      var options = {
        chart: {
          height: 350,
          background: '#202125',
          type: 'line',
          zoom: {
            enabled: false
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          },
          toolbar: {
            show: false
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'straight',
          width: 1,
        },
        series: [
          {
            name: "Redeemed Coupin",
            data: [
              [new Date('9/27/2018').getTime(), 193],
              [new Date('10/11/2018').getTime(), 318],
              [new Date('10/25/2018').getTime(), 293],
              [new Date('11/8/2018').getTime(), 360],
              [new Date('11/22/2018').getTime(), 236],
              [new Date('12/6/2018').getTime(), 211],
              [new Date('12/20/2018').getTime(), 390],
            ],
          },
          {
            name: "Generated Coupin",
            data: [
              [new Date('9/27/2018').getTime(), 161],
              [new Date('10/11/2018').getTime(), 313],
              [new Date('10/25/2018').getTime(), 465],
              [new Date('11/8/2018').getTime(), 159],
              [new Date('11/22/2018').getTime(), 191],
              [new Date('12/6/2018').getTime(), 364],
              [new Date('12/20/2018').getTime(), 493],
            ],
          },
        ],
        grid: {
          borderColor: 'rgba(231, 233, 237, 0.15)',
          xaxis: { lines: { show: false, } },
          yaxis: { lines: { show: true, } },
        },
        xaxis: {
          type: 'datetime',
          axisTicks: { show: false, },
          axisBorder: {
            show: true,
            borderType: 'solid',
            color: 'rgba(231, 233, 237, 0.65)',
          },
          labels: {
            show: true,
            style: {
              colors: '#FFFFFF',
              fontSize: '11px',
              fontFamily: 'Nunito Sans',
            },
          }
        },
        yaxis: {
          show: true,
          showAlways: true,
          axisTicks: { show: false, },
          axisBorder: {
            show: true,
            borderType: 'solid',
            // color: '#E7E9ED',
            color: 'rgba(231, 233, 237, 0.65)',
          },
          labels: {
            show: true,
            style: {
              colors: '#fff',
              fontSize: '11px',
              fontFamily: 'Nunito Sans',
              cssClass: 'linechart-yaxis-label'
            },
          }
        },
        colors: ['#08AEEA', '#15A580'],
        markers: {
          size: 3,
          strokeWidth: 0,
          hover: {
            size: 5,
          }
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
        },
        tooltip: {
          enabled: true,
          theme: 'dark',
        }
      }

      scope.lineChart = new ApexCharts(
        document.querySelector("#generated-vs-redeemed"),
        options
      );

      scope.lineChart.render();
    })();

    // update the barchart values
    scope.$watch('data', function (val) {
      scope.lineChart.updateSeries(val);
    });
  }
}

