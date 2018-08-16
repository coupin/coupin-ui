angular.module('FeaturedCtrl', []).controller('FeaturedController', function(
  $scope,
  merchants,
  AdminService,
  UtilService
) {
  $scope.featured = {
    first: null,
    second: null,
    third: null
  };
  $scope.loading = false;
  $scope.merchants = merchants;

  AdminService.retrieveHotList().then(function(response) {
    $scope.featured = response.data.featured ? response.data.featured : $scope.featured;
  }).catch(function() {
    UtilService.showError('Uh oh!', 'An error occured while getting featured. Try again or notify IT.');
  });

  $scope.canSubmit = function(isFeatured) {
    if (isFeatured) {
      return UtilService.isDefined($scope.featured.first) && UtilService.isDefined($scope.featured.second) && UtilService.isDefined($scope.featured.third);
    } else {}
  };

  $scope.getLogo = function(index) {
    return UtilService.isDefined($scope.featured[index]) ? $scope.featured[index].merchantInfo.logo.url : '../../img/placeholder_m.png';
  };

  $scope.update = function(isFeatured) {
    $scope.loading = true;
    var data = {
      isFeatured: isFeatured
    };
    if (isFeatured) {
      data['featured'] = $scope.featured;
    }

    AdminService.setHotList(data).then(function(response) {
      UtilService.showSuccess('Success!', 'Featured was set successfully');
      $scope.loading = false;
    }).catch(function(err) {
      UtilService.showError('Uh oh!', err.data.toString());
      $scope.loading = false;
    });
  };
});