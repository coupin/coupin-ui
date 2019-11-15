angular.module('FeaturedCtrl', []).controller('FeaturedController', function(
  $scope,
  merchants,
  AdminService,
  Upload,
  UtilService
) {
  var availableIndex = [0, 1, 2, 3, 4];
  $scope.bounds = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  };
  $scope.featured = {
    first: null,
    second: null,
    third: null
  };
  $scope.image = {
    src: null,
    dst: null
  };
  $scope.slide = {
    id: null,
    index: null,
    url: null
  };
  $scope.loading = false;
  $scope.merchants = merchants;
  $scope.progress = 0;
  $scope.totalSlides = 0;
  $scope.uploadingBanner = false;

  AdminService.retrieveHotList().then(function(response) {
    var data = response.data;
    $scope.featured = data.featured ? data.featured : $scope.featured;
    $scope.slides = data.hotlist ? data.hotlist : [];
    $scope.slides.forEach(function (element) {
      var slideIndex = availableIndex.indexOf(element.index);
      if (slideIndex > -1) {
        availableIndex.splice(slideIndex, 1);
      }
    });
    $scope.totalSlides = $scope.slides.length;
  }).catch(function(err) {
    console.log(err);
    UtilService.showError('Uh oh!', err.data);
  });

  /**
   * Check to see if user can submit
   * @param {Boolean} isFeatured to determine if featured or hotlist
   */
  $scope.canSubmit = function(isFeatured) {
    if (isFeatured) {
      return UtilService.isDefined($scope.featured.first) && UtilService.isDefined($scope.featured.second) && UtilService.isDefined($scope.featured.third);
    } else {
      return UtilService.isDefined($scope.slide.id) && UtilService.isDefined($scope.image.dst) && $scope.totalSlides < 5;
    }
  };

  /**
   * Reset upload variables
   */
  function resetUploads() {
    $scope.image = {
      src: null,
      dst: null
    };
    $scope.slide = {
      id: null,
      index: null,
      url: null
    };
    $scope.progress = 0;
    $scope.uploadingBanner = false;
  }

  /**
   * Upload a slide
   * @param {File} picture 
   * @param {String} filename 
   */
  function uploadSlide(picture, filename) {
    Upload.upload({
        url: '/upload',
        method: 'POST',
        file: picture,
        fields: {
            public_id: filename
        }
    }).then(function(resp) {
      $scope.slide.index = +(resp.data.public_id.charAt(resp.data.public_id.length - 1));
      $scope.slide.url = resp.data.url;
      $('#cropModal').modal('hide');
      UtilService.showSuccess('Success!', 'Image has been uploaded.');
    }, function(err) {
      UtilService.showError('Uh oh!', err.data.toString());
    }, function(evt) {
      $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
    }).catch(function(err) {
      UtilService.showError('Uh oh!', err.data);
    });
  };

  /**
   * Check file and make upload
   * @param {*} image 
   * @param {*} isLogo 
   */
  $scope.fileCheck = function(image) {
    var limit = 900000;
    var file;

    if (UtilService.isDefined(image.src)) {
        isuploading = true;
        var dataurl = image.dst;
        var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }

        try {
            file = new File([u8arr], "" + image.src.length, {type:mime});
        } catch (err) {
            file = new Blob([u8arr], {type:mime});
            file.name = "" + image.src.length;
            file.lastModified = new Date();
        }

        if (file.size > limit) {
          limit = limit / 100;
          showError('Uh Oh!', "File is too large, must be " + temp + "KB or less.");
        } else {
          uploadSlide(file, 'slide-' + availableIndex[0]);
        }
    }
  };

  /**
   * Get logo of merchant for featured
   * @param {Number} index 
   */
  $scope.getLogo = function(index) {
    return UtilService.isDefined($scope.featured[index]) ? $scope.featured[index].merchantInfo.logo.url : '../../img/placeholder_m.png';
  };

  $scope.removeSlide = function(index) {
    var innerIndex = $scope.slides[index].index;
    AdminService.deleteSlide($scope.slides[index]).then(function(response) {
      $scope.slides.splice(index, 1);
      availableIndex.push(innerIndex);
      $scope.totalSlides--;
      UtilService.showSuccess('Success!', 'Slide removed successfully');
    }).catch(function(err) {
      console.log(err);
      UtilService.showError('Uh oh!', err.data);
    });
  };

  /**
   * Update the database
   * @param {Boolean} isFeatured 
   */
  $scope.update = function(isFeatured) {
    $scope.loading = true;
    var data = {
      isFeatured: isFeatured
    };

    if (isFeatured) {
      data['featured'] = $scope.featured;
    } else {
      data['slide'] = $scope.slide;
    }

    AdminService.setHotList(data).then(function(response) {
      $scope.loading = false;
      UtilService.showSuccess('Success!', 'Featured was set successfully');
      if (!isFeatured) {
        availableIndex.shift();
        $scope.totalSlides++;
        $scope.slides.push($scope.slide);
        resetUploads();
      }
    }).catch(function(err) {
      console.log(err);
      UtilService.showError('Uh oh!', err.data);
      $scope.loading = false;
    });
  };
});