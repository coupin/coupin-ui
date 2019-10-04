angular.module('AnalyticsCtrl', []).controller('AnalyticsController', function ($scope) {
  /** IIFE for chart by the side */
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
      series: [62.5],
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
  
    var chart = new ApexCharts(document.querySelector('#overall-coupin-stat_radar'), options);
  
    chart.render();
  })();

  $scope.loadingRewards = false;
  $scope.rewards = [{
    _id: '27da3b78-0ee5-4039-8048-c1e473bd88d3',
    name: 'luctus nec molestie sed',
    added: '7/5/2019',
    expires: '8/8/2019',
    coupins: {
      generated: 1098,
      redeemed: 457,
    },
  }, {
    _id: 'b3e6988b-2fad-4b7d-9a6d-99bd28799313',
    name: 'eu massa donec dapibus',
    added: '5/13/2019',
    expires: '10/19/2018',
    coupins: {
      generated: 12842,
      redeemed: 11082,
    },
  }, {
    _id: '1203331e-6103-45ef-8b0f-2b3d9a0c5556',
    name: 'nulla nisl nunc',
    added: '7/24/2019',
    expires: '10/20/2018',
    coupins: {
      generated: 7394,
      redeemed: 4785,
    },
  }, {
    _id: '6b01c1b1-fc46-407b-9666-c1a43c4000f5',
    name: 'nullam varius',
    added: '5/17/2019',
    expires: '5/26/2019',
    coupins: {
      generated: 350,
      redeemed: 145,
    },
  },{
    _id: '27da3b78-0ee5-4039-8048-c1e473bd88d3',
    name: 'luctus nec molestie sed',
    added: '7/5/2019',
    expires: '8/8/2019',
    coupins: {
      generated: 1098,
      redeemed: 457,
    },
  }, {
    _id: 'b3e6988b-2fad-4b7d-9a6d-99bd28799313',
    name: 'eu massa donec dapibus',
    added: '5/13/2019',
    expires: '10/19/2018',
    coupins: {
      generated: 12842,
      redeemed: 11082,
    },
  }, {
    _id: '1203331e-6103-45ef-8b0f-2b3d9a0c5556',
    name: 'nulla nisl nunc',
    added: '7/24/2019',
    expires: '10/20/2018',
    coupins: {
      generated: 7394,
      redeemed: 4785,
    },
  }, {
    _id: '6b01c1b1-fc46-407b-9666-c1a43c4000f5',
    name: 'nullam varius',
    added: '5/17/2019',
    expires: '5/26/2019',
    coupins: {
      generated: 350,
      redeemed: 145,
    },
  }];

  $scope.goToReward = function (rewardId) {
    console.log(rewardId);
  };

  $scope.picker = new Lightpick({
    field: document.getElementById('datepicker'),
    singleDate: false,
    numberOfMonths: 2,
    onSelect: function (start, end) {
      $scope.start = start
      $scope.end = end

      onDatePickerChange()
    }
  });

  $scope.picker.setDateRange(moment().subtract(30, 'day'), moment())

  function onDatePickerChange() {
    if ($scope.start && $scope.end) {
      console.log($scope.start.format())
      console.log($scope.end.format())
    }
  }
});