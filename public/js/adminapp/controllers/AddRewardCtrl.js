angular.module('AddRewardCtrl', []).controller('AddRewardController', function(
  $scope,
  $state,
  rewardId,
  merchants,
  RewardsService,
  UtilService
) {
  var isEdit = false;
  var selectAll = false;
  var upload = false;
  var weekDays = false;
  var weekEnds = false;

  $scope.activeRewards = [];
  $scope.bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  $scope.dates = {
    startDate: null,
    endDate: null
  };
  $scope.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  $scope.deletePhotos = [];
  $scope.files = [];
  $scope.image = {
      src: null,
      dst: null
  };
  $scope.loading = false;
  $scope.inactiveRewards = [];
  $scope.merchants = merchants;
  $scope.minDate = new Date();
  $scope.photos = [];
  $scope.update = false;
  $scope.uploading = false;

  if (UtilService.isDefined(rewardId)) {
    $scope.loading = true;
    $scope.categories = {};
    $scope.update = true;
    RewardsService.getReward(rewardId).then(function(result) {
        $scope.newReward = result.data;
        $scope.newReward.endDate = new Date($scope.newReward.endDate);
        $scope.newReward.startDate = new Date($scope.newReward.startDate);
        $scope.newReward.applicableDays.forEach(function(x) {
            $('#'+x).css('background', '#2e6da4');
            $('#'+x).css('color', '#fff');
        });
        $scope.newReward.categories.forEach(function(category) {
            $scope.categories[category] = true;
        });
        $scope.newReward.pictures = 'pictures' in $scope.newReward ? $scope.newReward.pictures : [];
        $scope.photos = $scope.newReward.pictures;
        $scope.dates = {
            startDate: $scope.newReward.startDate,
            endDate: $scope.newReward.endDate
        };
    }).catch(function(error) {
        console.log(error);
        UtilService.showError(errTitle, errMsg);
    });
  } else {
    $scope.newReward = {
      applicableDays: [],
      categories: [],
      multiple: {},
      pictures: []
    };
  }

  /**
   * Add a category to the rewards
   * @param {String} category 
   */
  $scope.addCat = function (category) {
    if ($scope.newReward.categories.indexOf(category) == -1) {
        $scope.newReward.categories.push(category);
    } else {
        $scope.newReward.categories.splice($scope.newReward.categories.indexOf(category), 1);
    }
  };

  /**
   * Check all days of the week
   */
  $scope.checkAll = function () {
    if (!selectAll) {
      selectAll = true;
      for (var y = 0; y < 7; y++) {
          if ($scope.newReward.applicableDays.indexOf(y) == -1) {
              $scope.newReward.applicableDays.push(y);
              $('#'+y).css('background', '#2e6da4');
              $('#'+y).css('color', '#fff');
          }
      }
    } else {
      selectAll = false;
      for (var y = 0; y < 7; y++) {
          const index = $scope.newReward.applicableDays.indexOf(y);
          if (index > -1) {
              $scope.newReward.applicableDays.splice(index, 1);
              $('#'+y).css('background', '#fff');
              $('#'+y).css('color', '#2e6da4');
          }
      }
    }
  };

  /**
   * Create new reward
   * @param {Object} reward 
   */
  $scope.createReward = function (reward) {
    $scope.loading = true;
    reward.startDate = $scope.dates.startDate;
    reward.endDate = $scope.dates.endDate;
    RewardsService.create(reward).then(function (result) {
        UtilService.showSuccess('Success', 'Reward Created Successfully.');
        $scope.newReward = result.data;
        $scope.loading = false;
        $scope.upload(result.data._id, true);
    }).catch(function (err) {
        $scope.loading = false;
        UtilService.showError(errTitle, errMsg);
    })
  };

  /**
   * Select particular day
   * @param {String} x 
   */
  $scope.day = function (x) {
    if ($scope.newReward.applicableDays.indexOf(x) == -1) {
        $scope.newReward.applicableDays.push(x);
        $('#'+x).css('background', '#2e6da4');
        $('#'+x).css('color', '#fff');
    } else {
        $scope.newReward.applicableDays.splice($scope.newReward.applicableDays.indexOf(x), 1);
        $('#'+x).css('background', '#fff');
        $('#'+x).css('color', '#2e6da4');
    }
  };

  /**
   * Determine if to diaply photos or not
   */
  $scope.displayRewardPhotos = function() {
    return $scope.photos.length > 0;
  };

  /**
   * Check file and make upload
   * @param {*} image 
   */
  $scope.fileCheck = function(image, isLogo) {
    var limit = 200000;

    if ($scope.photos.length === 4) {
        $('#croppingModal').modal('hide');
        UtilService.showError('Uh Oh!', 'You can only have 4 Reward Pictures at a time.');
    } else if (UtilService.isDefined(image.src)) {
        isuploading = true;
        var dataurl = image.dst;
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        
        var file = new File([u8arr], `${$scope.photos.length}`, {type:mime});

        if (file.size > limit) {
            limit = limit / 100;
            UtilService.showError('Uh Oh!', `File is too large, must be ${limit}KB or less.`);
        } else {
            $scope.files.push(file);
            $scope.photos.push({
                url: dataurl
            });
            $scope.image = {
                src: null,
                dst: null
            };
            $('#croppingModal').modal('hide');
        }
    }
  };

  $scope.isFormError = function(form) {
    return UtilService.isFormError(form) || $scope.dates.startDate === null ||
     $scope.dates.startDate === null || $scope.newReward.categories.length === 0 ||
     $scope.newReward.applicableDays === 0;
  };

  /**
   * Navigate back to list of rewards
   */
  $scope.navigateToList = function() {
    $state.go('portal.view-rewards', {});
  };

  /**
   * Remove images and mark them uploaded
   * images for deletion
   * @param {*} index 
   */
  $scope.removeImage = function(index) {
    if ('id' in $scope.photos[index]) {
        $scope.deletePhotos.push($scope.photos[index].id);
    }

    $scope.files.splice(index, 1);
    $scope.photos.splice(index, 1);
  };

  $scope.setEndDate = function(days) {
    $scope.newReward.endDate = moment($scope.newReward.startDate).add(days, 'day').toDate();
  };

  /**
   * Update existing reward and
   * replace images if any have been uploaded
   * or deleted
   * @param {*} reward 
   * @param {*} upload 
   */
  $scope.updateReward = function (reward, upload) {
    $scope.loading = true;
    if (UtilService.isDefined($scope.dates.startDate)) {
        reward.startDate = $scope.dates.startDate;
        reward.endDate = $scope.dates.endDate;
    }
    RewardsService.update(reward._id, reward).then(function(response) {
        if ($scope.deletePhotos.length > 0) {
            UtilService.deletePhotos($scope.deletePhotos);
        }

        UtilService.showSuccess('Success', 'Your Reward updated successfully.');
        $scope.loading = false;
    }).catch(function(error) {
        UtilService.showError('Uh Oh!', error.data.message);
        $scope.loading = false;
    });
  };

  /**
   * Upload images
   * @param {*} id 
   */
  $scope.upload = function(id) {
    if ($scope.files.length > 0) {
      $scope.uploading = true;

      Upload.upload({
          url: '/uploads',
          method: 'POST',
          arrayKey: '',
          data: {
              photos: $scope.files,
              public_id: id
          }
      }).then(function(resp) {
          var count = 0;

          resp.data.forEach(function(data) {
              var total = $scope.photos.length;
              var found = false;
              
              while(count < total && !found) {
                  if ($scope.photos[count].url.includes('data')) {
                      $scope.photos[count] = data;
                      found = true;
                  }
                  count++;
              }
          });

          $scope.newReward.pictures = $scope.photos;
          UtilService.showSuccess('Success', 'Your Pictures were uploaded successfully.');
          setTimeout(function() {
              $scope.uploading = false;
              $scope.updateReward($scope.newReward);
          }, 2000);
      }, function(err) {
          $scope.uploading = false;
          UtilService.showError('Uh Oh!', 'Your reward images failed to upload. Please try again.');
      }, function(evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          $scope.progress = progressPercentage;
      }).catch(function(err) {
          $scope.uploading = false;
          UtilService.showError('Uh Oh!', 'Your pictures failed to upload. Please try again.')
      });
    }
  };

  /**
   * Check only weekends
   */
  $scope.weekDay = function () {
    if (!weekDays) {
        weekDays = true;
        for (var y = 0; y < 5; y++) {
            if ($scope.newReward.applicableDays.indexOf(y) == -1) {
                $scope.newReward.applicableDays.push(y);
                $('#'+y).css('background', '#2e6da4');
                $('#'+y).css('color', '#fff');
            }
        }
    } else {
        weekDays = false;
        for (var y = 0; y < 5; y++) {
            const index = $scope.newReward.applicableDays.indexOf(y);
            if (index > -1) {
                $scope.newReward.applicableDays.splice(index, 1);
                $('#'+y).css('background', '#fff');
                $('#'+y).css('color', '#2e6da4');
            }
        }
    }
  };

  /**
   * Check only weekdays
   */
  $scope.weekEnd = function () {
    if (!weekEnds) {
        weekEnds = true;
        for (var y = 4; y < 7; y++) {
            if ($scope.newReward.applicableDays.indexOf(y) == -1) {
                $scope.newReward.applicableDays.push(y);
                $('#'+y).css('background', '#2e6da4');
                $('#'+y).css('color', '#fff');
            }
        }
    } else {
        weekEnds = false;
        for (var y = 4; y < 7; y++) {
            const index = $scope.newReward.applicableDays.indexOf(y);
            if (index > -1) {
                $scope.newReward.applicableDays.splice(index, 1);
                $('#'+y).css('background', '#fff');
                $('#'+y).css('color', '#2e6da4');
            }
        }
    }
  };
});