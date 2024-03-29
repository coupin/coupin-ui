angular.module('coupinApp').directive('showMore', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attr) {
      element.addClass('shorten');
      element.css('cursor', 'pointer');

      if (attr.showMore === "true") {
        element.on('click', function (event) {
          event.stopImmediatePropagation();
          element.toggleClass('shorten');
        });
      }
    }
  }
}).directive('allCaps', function () {
  return {
    retrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attr, ngModel) {
      ngModel.$parsers.push(function(value) {
        return value.toUpperCase();
      });

      element.on('blur', function () {
        ngModel.$setViewValue(ngModel.$modelValue);
        ngModel.$render();
      });

      // ngModel.$formatters.push(function(value) {
      //   if (!value) {
      //     return;
      //   }
      //   console.log(value);
      //   return value.toUpperCase();
      // });
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
    },
  };
}).directive('cpRewardAnalyticsGenderDistribution', function () {
  return {
    restrict: 'E',
    template: '<div id="gender-distribution"></div>',
    scope: {
      data: '=',
    },
    link: function (scope, elem, attr) {
      scope.barChart;
      // IIFE for gender barchart
      (function () {
        var options = {
          chart: {
            height: 350,
            width: 350,
            type: 'pie',
            background: '#313237',
            foreColor: '#FFFFFF'
          },
          labels: [
            'Male',
            'Female',
            'Unspecified',
          ],
          plotOptions: {
            pie: {
              dataLabels: {
                offset: -10
              },
            }
          },
          colors: ['#002B24', '#034d44', '#077368'],
          dataLabels: {
            enabled: true,
            textAnchor: 'middle'
          },
          expandOnClick: true,
          series: [],
          stroke: {
            show: true,
            curve: 'straight',
            lineCap: 'butt',
            colors: '#FFFFFF',
            width: .3,
          },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 300
              },
              legend: {
                fontFamily: 'Nunito Sans',
                fontSize: '12px',
                height: 24,
                labels: {
                  colors: ['#FFFFFF'],
                },
                offsetY: 10,
                position: 'bottom',
                show: true
              }
            },
          }],
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
}).directive('cpRewardAnalyticsAgeDistribution', function () {
  return {
    restrict: 'E',
    template: '<div id="age-distribution"></div>',
    scope: {
      data: '='
    },
    link: function (scope, elem, attr) {
      scope.barChart;
      // IIFE for age column chart
      // IIFE for age column chart
      (function () {
        var options = {
          chart: {
            height: 350,
            type: 'bar',
            background: '#313237',
            foreColor: '#FFFFFF'
          },
          series: [{
            name: 'age-distribution',
            data: []
          }],
          colors: ['#077368'],
          dataLabels: {
            enabled: false
          },
          plotOptions: {
            bar: {
              horizontal: false
            }
          },
          xaxis: {
            categories: [
              'Below 15',
              '15 - 24',
              '25 - 34',
              '35 - 44',
              '45+',
              'Unspecified'
            ]
          },
          tooltip: {
            enabled: true,
            theme: 'dark',
          }
        };

        scope.barChart = new ApexCharts(
          document.querySelector("#age-distribution"),
          options
        );

        scope.barChart.render();
      })()

      // update the barchart values
      scope.$watch('data', function (val) {
        console.log('val ==> ', val)
        scope.barChart.updateSeries([{
          data: val
        }])
      });
    }
  }
}).directive('cpRewardAnalyticsGeneratedVsRedeemedCoupins', function () {
  return {
    restrict: 'E',
    template: '<div id="generated-vs-redeemed"></div>',
    scope: {
      data: '=',
      reward: '='
    },
    link: function (scope, elem, attr) {
      scope.lineChart;
      // IIFE for age column chart
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
}).directive('cpRewardAnalyticsDeliveryDistribution', function () {
  return {
    restrict: 'E',
    template: '<div id="delivery-distribution"></div>',
    scope: {
      data: '=',
    },
    link: function (scope, elem, attr) {
      scope.barChart;
      // IIFE for delivery barchart
      (function () {
        var options = {
          chart: {
            height: 350,
            width: 350,
            type: 'pie',
            background: '#313237',
            foreColor: '#FFFFFF'
          },
          labels: [
            'Delivery',
            'Pick Up'
          ],
          plotOptions: {
            pie: {
              dataLabels: {
                offset: -10
              },
            }
          },
          colors: ['#002B24', '#034d44'],
          dataLabels: {
            enabled: true,
            textAnchor: 'middle'
          },
          expandOnClick: true,
          series: [],
          stroke: {
            show: true,
            curve: 'straight',
            lineCap: 'butt',
            colors: '#FFFFFF',
            width: .3,
          },
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 300
              },
              legend: {
                fontFamily: 'Nunito Sans',
                fontSize: '12px',
                height: 24,
                labels: {
                  colors: ['#FFFFFF'],
                },
                offsetY: 10,
                position: 'bottom',
                show: true
              }
            },
          }],
          tooltip: {
            enabled: true,
            theme: 'dark',
          }
        }

        scope.barChart = new ApexCharts(
          document.querySelector("#delivery-distribution"),
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
});