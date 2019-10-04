angular.module('RewardDetailAnalyticsCtrl', []).controller('RewardDetailAnalyticsController', function ($scope) {
  (function () {
    var options = {
      chart: {
        height: 350,
        background: '#313237',
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
          // data: [193,318,293,360,211,236,390]
          data: [[new Date('9/27/2018').getTime(), 193], [new Date('10/11/2018').getTime(), 318], [new Date('10/25/2018').getTime(), 293], [new Date('11/8/2018').getTime(), 360], [new Date('11/22/2018').getTime(), 236], [new Date('12/6/2018').getTime(), 211], [new Date('12/20/2018').getTime(), 390],],
        },
        {
          name: "Generated Coupin",
          // data: [161,313,465,159,191,364,493]
          data: [[new Date('9/27/2018').getTime(), 161], [new Date('10/11/2018').getTime(), 313], [new Date('10/25/2018').getTime(), 465], [new Date('11/8/2018').getTime(), 159], [new Date('11/22/2018').getTime(), 191], [new Date('12/6/2018').getTime(), 364], [new Date('12/20/2018').getTime(), 493],]
        }
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
        offsetY: -12,
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

    var chart = new ApexCharts(
      document.querySelector("#generated-vs-redeemed"),
      options
    );

    chart.render();
  })();

  // IIFE for gender barchart
  (function () {
    var options = {
      chart: {
        height: 350,
        type: 'bar',
        background: '#313237',
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
      colors: ['#08AEEA', '#15A580'],
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
        offsetY: -10,
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
          return val + '%';
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

    var chart = new ApexCharts(
      document.querySelector("#gender-distribution"),
      options
    );

    chart.render();
  })();

  // IIFE for age column chart
  (function () {
    var options = {
      chart: {
        height: 350,
        type: 'bar',
        background: '#313237',
        stacked: true,
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
        offsetX: -300,
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

    var chart = new ApexCharts(
      document.querySelector("#age-distribution"),
      options
    );

    chart.render();
  })()
});