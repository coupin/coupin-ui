angular.module('ProfileCtrl', []).controller('ProfileController', function(
  $scope,
  $q,
  $window,
  ENV_VARS,
  StorageService,
  MerchantService,
  UtilService,
  Upload
) {
  $scope.loadingPosition = false;
  $scope.progress = 0;
  $scope.uploadingLogo = false;
  $scope.updating = false;
  $scope.editable = false;
  $scope.updatingPassword = false;
  $scope.states = ['lagos'];
  $scope.settings = 'personal';
  $scope.position = {
    long: $scope.user.merchantInfo.location[0],
    lat: $scope.user.merchantInfo.location[1]
};
  
  
  $scope.bounds = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
  };

  var selected = false;
  var logo = $scope.user.merchantInfo.logo && $scope.user.merchantInfo.logo.url ? $scope.user.merchantInfo.logo.url : '../img/logo.jpg';
  var banner = $scope.user.merchantInfo.banner && $scope.user.merchantInfo.banner.url  ? $scope.user.merchantInfo.banner.url : '../img/banner_alt.png';
  $scope.image = {
      src: null,
      dst: null
  };
  var amount = 0;
  var bill = false;
  var isPayAsYouGo = $scope.user.merchantInfo.billing.plan === 'payAsYouGo';
  var hasExpired = ($scope.user.merchantInfo.billing.history[0] && moment(new Date()).isAfter($scope.user.merchantInfo.billing.history[0].expiration)) || false;

if (!$scope.user) {
  $scope.user = StorageService.getUser();
  $scope.position = {
      long: $scope.user.merchantInfo.location[0],
      lat: $scope.user.merchantInfo.location[1]
  };
}

$scope.billing = {
    plan: $scope.user.merchantInfo.billing.plan,
    reference: null,
    date: new Date()
};
$scope.history = $scope.user.merchantInfo.billing.history;

  $scope.bannerStyle = {
    "background-image": `url("${banner}")`
  };

  $scope.logoStyle = {
    "background-image": `url("${logo}")`
  };

  /**
   * Validate User details
   * @param {Object} user 
   */
  function validateUser(user) {
    var error = '';

    if (!('email' in user)) {
        UtilService.showError('An error occured', 'Email cannot be empty');
        return false;
    } else if (!UtilService.isEmail(user.email)) {
        UtilService.showError('An error occured', 'Email is invalid');
        return false;
    }

    if ('companyName' in user.merchantInfo && user.merchantInfo.companyName.length === 0) {
        UtilService.showError('An error occured', 'Company name cannot be empty');
        return false;
    }

    if ('companyDetails' in user.merchantInfo && user.merchantInfo.companyDetails.length < 15) {
        UtilService.showError('An error occured', 'Company details must be more than 15 characters');
        return false;
    }

    if ('mobileNumber' in user.merchantInfo && !UtilService.isNumber(user.merchantInfo.mobileNumber)) {
        UtilService.showError('An error occured', 'Mobile number is invalid');
        return false;
    }

    if ('address' in user.merchantInfo && user.merchantInfo.address.length < 10) {
        UtilService.showError('An error occured', 'Address is too vague. Please put more detail.');
        return false;
    }

    if ('city' in user.merchantInfo && user.merchantInfo.city.length < 3) {
        UtilService.showError('An error occured', 'City name is too short. Please try again');
        return false;
    }

    if ('state' in user.merchantInfo && user.merchantInfo.state.length < 3) {
        UtilService.showError('An error occured', 'State name is too short. Please try again');
        return false;
    }

    if ($scope.position && (!('lat' in $scope.position) || !('long' in $scope.position))) {
        UtilService.showError('An error occured', 'Location must have both latitude and longitude');
        return false;
    } else if ($scope.position && (!UtilService.isDecimal($scope.position.lat.toString()) || !UtilService.isDecimal($scope.position.long.toString()))) {
        UtilService.showError('An error occured', 'Location, latitude and longitude, must be decimals');
        return false;
    }

    return true;
  }

  function resetUploads() {
    $scope.progress = 0;
    $scope.uploadingLogo = false;
    $scope.uploadingBanner = false;
  }

  /**
   * CHANGE PASSWORD
   * @param {*} password 
   * @param {*} confirm 
   */
  $scope.changePassword = function (password, confirm) {
    $scope.updatingPassword = true;
    if (password === confirm) {
        MerchantService.changePassword(password).then(function (response) {
            $scope.updatingPassword = false;
            UtilService.showSuccess('Success!', 'Password was updated successfully')
            $('#passwordModal').modal('hide');
        }).catch(function (err) {
            $scope.updatingPassword = false;
            if (err.status === 500) {
                UtilService.showError('Oops!', 'An Error Occured, Please Try Again');
            } else {
                UtilService.showError('oops!', err.data.message);
            }
        });
    } else {
        UtilService.showError('Oops', 'The passwords do not match');
    }
  };

  $scope.displayRenew = function() {
    return !isPayAsYouGo && hasExpired;
  };

  function fileCheck(x, isLogo) {
      if (UtilService.isDefined(x)) {
        if (isLogo) {
            $scope.uploadingLogo = true;
        } else {
            $scope.uploadingBanner = true;
        }

        return true;
      } else {
        var msg = isLogo ? 'Please make sure image is at least 200x200 and is at most 2MB.' 
        : 'Please make sure image is at least 950x323 and is at most 3MB.';
        UtilService.showError('Invalid Image', msg)
        return false;
      }
  };


    $scope.setSettings = function(page) {
        $scope.settings = page;
    };

  $scope.upload = function(picture, name, isLogo) {
    if (fileCheck(picture, isLogo)) {
        var filename = isLogo ? name + '-logo' : name + '-banner';
        Upload.upload({
            url: '/upload',
            method: 'POST',
            file: picture,
            fields: {
                public_id: filename
            }
        }).then(function(resp) {
            console.log(resp.data)
            if (isLogo) {
                $scope.user.merchantInfo.logo = {
                    id: resp.data.public_id,
                    url: resp.data.secure_url
                };
            } else {
                $scope.user.merchantInfo.banner = {
                    id: resp.data.public_id,
                    url: resp.data.secure_url
                };
            }
            $('#cropModal').modal('hide');
            $scope.update().then(function () {
                setTimeout(function() {
                    $window.location.reload();
                }, 2000);
            });
        }, function(err) {
            resetUploads();
            UtilService.showError('oops!', err.data);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.progress = progressPercentage;
        }).catch(function(err) {
            resetUploads();
            UtilService.showError('oops!', err.data);
        });
    }
  };
  
  /**
   * Get Merchant's current location
   */
  $scope.getLocation = function () {
    $scope.loadingPosition = true;
    navigator.geolocation.getCurrentPosition(function (position) {
      $scope.position.lat = position.coords.latitude;
      $scope.position.long = position.coords.longitude;
      $scope.loadingPosition = false;
      $scope.$digest();
    });
  };

  $scope.setPlan = function(plan) {
    $scope.billing.plan = plan;
    if (plan === 'monthly') {
        amount = 57000;
        bill = true;
    } else if (plan === 'yearly') {
        amount = 750000;
        bill = true;
    } else {
        bill = false;
    }
  };

  $scope.showHistory = function() {
      return $scope.history.length > 0;
  };

  $scope.toggleEditable = function() {
    $scope.editable = !$scope.editable;
  };

  /**
   * Update user profile
   */
  $scope.update = function () {
    if (validateUser($scope.user)) {
      $scope.updating = true;
      if ($scope.position && 'lat' in $scope.position && 'long' in $scope.position) {
        $scope.user.merchantInfo.location = [
          $scope.position.long,
          $scope.position.lat
        ];
      }

      var deferred = $q.defer();

    MerchantService.update($scope.user.id, $scope.user.merchantInfo).then(function (response) {
        StorageService.setUser(response.data);
        $('#cropModal').modal('hide');
        UtilService.showSuccess('Success!', 'Profile updated successfully')
        $scope.updating = false;
        deferred.resolve();
      }).catch(function (err) {
        $scope.updating = false;
        if (!(err.status === 500) && err.data) {
            UtilService.showError('oops!', err.data);
            deferred.reject(err.data);
        } else {
            UtilService.showError('Oops!', 'An Error Occured, Please Try Again');
            deferred.reject('An Error Occured, Please Try Again');
        }
      });

      return deferred.promise;
    }
  };

  function persistBillingInfo() {
    MerchantService.updateBilling($scope.user.id, $scope.billing)
        .then(function(response) {
            StorageService.setUser(response.data);
            if ($scope.billing.plan === $scope.user.merchantInfo.billing.plan) {
                UtilService.showSuccess('Success', `Subscription successfully renewed!`);
            } else {
                UtilService.showSuccess('Success', `Billing successfully changed to ${$scope.billing.plan} plan!`);
            }
            $('#billingModal').modal('hide');
            StorageService.setExpired(false);
            $window.location.reload();
        })
        .catch(function(err) {
            UtilService.showError('Uh Oh', 'There was an error while updating your billing info. please contact admin on admin@coupin.com');
        });
  }

  function validBilling() {
    if (isPayAsYouGo && $scope.billing.plan !== 'payAsYouGo') {
        return true;
    } else if (isPayAsYouGo && $scope.billing.plan === 'payAsYouGo') {
        UtilService.showInfo('Hey!', 'Pay As You Go cannot be renewed.');
        return false;
    } else {
        var isValid = moment(new Date()).isBefore($scope.user.merchantInfo.billing.history[0].expiration);
        if (isValid) {
            UtilService.showInfo('Hey!', 'Your current plan is yet to expire. Please wait for it to expire before renewing.');
            return false;
        } else {
            return true;
        }
    }
  }

  $scope.updateBilling = function(renew) {
    var valid = validBilling();
    if(valid && !renew) {
        if (bill) {
            makePayment();
        } else {
            persistBillingInfo();
        }
    } else {
        StorageService.setExpired(false);
        $window.location.reload();
        if (valid) {
            $scope.setPlan($scope.user.merchantInfo.billing.plan);
            makePayment();
        }
    }
  };

    /**
     * Check file and make upload
     * @param {*} image 
     * @param {*} isLogo 
     */
    $scope.fileCheck = function(image, isLogo) {
        var limit = isLogo ? 500000 : 900000;
        if (UtilService.isDefined(image.src)) {
            isuploading = true;
            var dataurl = image.dst;
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while(n--){
                u8arr[n] = bstr.charCodeAt(n);
            }
            
            var file = new File([u8arr], 'testing', {type:mime});

            if (file.size > limit) {
                limit = limit / 100;
                UtilService.showError('Uh Oh!', `File is too large, must be ${temp}KB or less.`);
            } else {
                $scope.upload(file, $scope.user.id, isLogo);
            }
        }
    };
});