angular.module('AuthCtrl', []).controller('AuthController', function(
    $scope,
    $http,
    $location,
    $state,
    $window,
    $alert,
    ENV_VARS,
    MerchantService,
    AuthService,
    StorageService,
    UtilService
) {
    // scope variable to hold form data
    $scope.formData = {};

    const strings = $location.absUrl().match(/\w+/g);
    
    
    // to show error and loading
    var amount = 0;
    var confirmed = false;
    var merchId = '';
    var encodedString = '';
    var plan = 'payAsYouGo';
    $scope.bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    $scope.image = {
        src: null,
        dst: null
    };
    $scope.loading = [false, false];
    $scope.planIndex = 0;
    $scope.progress = 0;
    $scope.showError = false;
    $scope.uploadingBanner = false;
    $scope.uploadingLogo = false;
    
    // States
    $scope.states = ['Abuja', 'Lagos', 'Rivers State'];
    
    // Get current merchant if merchant route called
    if($location.absUrl().includes('confirm')) {
        merchId = strings[strings.length - 2];
        
        if (merchId && merchId.length === 24) {
            MerchantService.confirm(merchId).then(function(response) {
                $scope.user = response.data;
            }).catch(function(err) {
                $scope.showErrors('Retrieval Failed', err.data.message);
            });
        } else {
            UtilService.showError('Uh Oh', 'Invalid id.');
        }
    }
    
    // Confirm Id if for change of password
    if($location.absUrl().includes('forgot-password')) {
        var encodedString = $location.search().query;

        AuthService.confirmEncodedString(encodedString).then(function(result) {
            confirmed = true;
            merchId = result.data.id;
        }).catch(function(err) {
            if (err.status === 500) {
                UtilService.showError('Uh Oh', 'Could not confirm id. Please contact admin at admin@coupin.com');
            } else {
                UtilService.showError('Uh Oh', err.data);
            }
        });
    }

    if (StorageService.isLoggedIn()) {
        $scope.user = StorageService.getUser();
        if ($scope.user.role > 1) {
            $state.go('dashboard.home', {});
        } else {
            $state.go('portal', {});
        }
    }

    // to hold categories
    $scope.categories = {
        foodndrinks : false,
        shopping : false,
        entertainment : false,
        healthnbeauty : false, 
        gadgets : false,
        groceries: false,
        tickets : false, 
        travel : false
    }

    // Non-scope variables
    var multipleAlerts = [];
    var hideAllAlerts = () => {
        if(multipleAlerts.length > 0) {
            for(var j = 0; j < multipleAlerts.length; j++) {
                multipleAlerts[j].hide();
            }
        }
    };

    /**
     * Add selected category to object
     * @param {Number} x index
     */
    $scope.addCat = (x) => {
        if($scope.categories[x] === false) {
            $scope.categories[x] = true;
        } else {
            $scope.categories[x] = false;
        }
    };

    function setUserInfo(data, setExpiration) {
        if (setExpiration) {
            var expirationDate = data.user.merchantInfo.billing.history[0].expiration;
            StorageService.setExpired(moment(expirationDate).isBefore());
        }
        StorageService.setToken(data.token);
        StorageService.setUser(data.user);
        $scope.user = data.user;
    }

    /**
     * Sign in Admin
     */
    $scope.signInA = () => {
        // show loading
        $scope.loading[0] = true;
        // reset show error back to false
        $scope.showError = false;

        // only go through if the object has 2 keys
        if(Object.keys($scope.formData).length == 2) {
            // check if the login details are correct, if so log in and redirect else show error
            AuthService.signinA($scope.formData)
            .then(function(response){
                setUserInfo(response.data, false);
                $state.go('portal.home', {});
            }, function(err) {
                $scope.loading[0] = false;
                $scope.loginError = 'Email or Password is invalid.'
                $scope.showError = true;
            });
        } else {
            $scope.loading[0] = false;
            $scope.loginError = 'Email and Password Cannot Be Empty';
            $scope.showError = true;
        }
    };

    /**
     * Check for plan
     * @param {Number} index 
     */
    $scope.planCheck = function(index) {
        return $scope.planIndex === index;
    };

    /**
     * Select a plan
     * @param {Number} index 
     */
    $scope.planSelect = function(index) {
        if (index === 0) {
            $scope.planIndex = 0;
            plan = 'payAsYouGo';
        } else if (index === 1) {
            $scope.planIndex = 1;
            amount = 57000;
            plan = 'monthly';
        } else if (index === 2) {
            $scope.planIndex = 2;
            amount = 750000;
            plan = 'yearly';
        }
     }

     /**
      * Make payment using paystack
      */
     function makePayment() {
         var date = new Date();
        var handler = PaystackPop.setup({
            key: ENV_VARS.payStackId,
            email: $scope.user.email,
            amount: amount * 100,
            ref: `${plan}-${merchId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getTime()}`,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Plan",
                        variable_name: "Billing_Plan",
                        value: `${$scope.user.merchantInfo.companyName} - ${plan}-${date.getTime()}`
                    }
                ]
            },
            callback: function(response){
                $scope.formData['billing'] = {
                    plan: plan,
                    date: date,
                    reference: response.reference
                };
                updateUser();
            },
            onClose: function(){
                $scope.loading = false;
                UtilService.showInfo('Payment Cancelled', 'Pay when you are ready.');
            }
        });
        handler.openIframe();
     }

     /**
      * Update user data
      */
     function updateUser() {
         $scope.loading[1] = true;
         MerchantService.complete(merchId, $scope.formData).then(function(response){
            // Get response data
            let data = response.data;

            // Show loading icon/screen
            $scope.loading[1] = false;

            // Handle service response
            UtilService.showSuccess('Confirmation Success', data.message);
            $window.location.href = '/auth';
        }).catch(function(err){
            $scope.loading[1] = false;
            UtilService.showError('Confirmation Failed', 'Your information failed to update, please check connection and try again.');
        });
     }

    /**
     * Used to complete merchants registration
     */
    $scope.completeMerch = function() {
        switch($scope.planIndex) {
            case 0:
                $scope.formData['billing'] = {
                    plan: plan,
                    date: new Date(),
                    reference: 'complete-registration'
                };
                updateUser();
                break;
            case 1:
            case 2:
                makePayment();
                break;
        }
    };

    $scope.submitPassword = function() {
        $scope.loading[1] = true;
        if ($scope.formData.password === $scope.formData.password2) {
            AuthService.changePassword(merchId, $scope.formData.password, encodedString).then(function(result) {
                UtilService.showSuccess('Success!', 'Password change successful.');
                $scope.formData = {};
            }).catch(function(err) {
                $scope.loading[1] = false;
                UtilService.showError('Uh Oh', err.data);
            });
        } else {
            $scope.loading[1] = false;
            UtilService.showError('Uh Oh', 'Passwords do not match. Please try again');
        }
    };

    function resetUploads() {
        $scope.progress = 0;
        $scope.uploadingLogo = false;
        $scope.uploadingBanner = false;
    }

    /**
     * Upload image and banner
     * @param {File} image The image.
     * @param {String} name The name of the image being uploaded.
     * @param {Boolean} isLogo true if logo and false if banner.
     */
    function upload(image, name, isLogo) {
        if (isLogo) {
            $scope.uploadingLogo = true;
        } else {
            $scope.uploadingBanner = true;
        }

        UtilService.uploadProfile(image, name, isLogo, function(response) {
            if (response.success) {
                if (isLogo) {
                    $scope.formData['logo'] = {
                        id: response.data.public_id,
                        url: response.data.url
                    };
                } else {
                    $scope.formData['banner'] = {
                        id: response.data.public_id,
                        url: response.data.url
                    };
                }
                $('#cropModal').modal('hide');
                resetUploads();
            } else {
                Util.showError('Upload Failed', response.data);
            }
        }, function(percentage) {
            $scope.progress = percentage;
        });
    }

    /**
     * Determine whether to show banner or not
     */
    $scope.showBanner = function() {
        return UtilService.isDefined($scope.formData.banner);
    };

    /**
     * Determine whether to show logo or not
     */
    $scope.showLogo = function() {
        return UtilService.isDefined($scope.formData.logo);
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
                showError('Uh Oh!', `File is too large, must be ${temp}KB or less.`);
            } else {
                upload(file, $scope.user._id, isLogo);
            }
        }
    };

    /**
     * Logs merchant into the system
     */
    $scope.loginMerch = () => {
        let details = {
            email : $scope.formData.loginEmail,
            password : $scope.formData.loginPassword
        };

        AuthService.signinM(details).then(function(response) {
            setUserInfo(response.data, true);
            $state.go('dashboard.home', {});
        }).catch(function(err) {
            $scope.loading[1] = false;
            UtilService.showError('Request Failed', err.data);
        });
    }

    /**
     * Used to register a merchant after they have been approved
     */
    $scope.registerMerch = () => {
        // Hide any existing alert
        hideAllAlerts();
        
        // Get final categories picked
        var finalCat = [];
        for(x in $scope.categories) {
            if($scope.categories[x] === true)
                finalCat[finalCat.length] = x;
        }
        $scope.formData.categories = finalCat;

        // Show loading icon
        $scope.loading[1] = true;

        // User service to register merchant
        AuthService.registerMerch($scope.formData)
        .then(function(response) {
            // Hide loading icon
            $scope.loading[1] = false;

            // Reset form data
            $scope.formData = {};
            $scope.categories = {
                foodndrinks : false,
                shopping : false,
                entertainment : false,
                healthnbeauty : false, 
                gadgets : false, 
                tickets : false, 
                travel : false
            }

            // Send out success alert
            UtilService.showSuccess('Success', response.data.message);
        })
        .catch(function(err) {
            console.log(err);
            $scope.loading[1] = false;
            if (err.data.code && err.data.code == 11000) {
                UtilService.showError('Request Failed', 'A merchant with that email address already exists.');
            } else {
                UtilService.showError('Request Failed', err.data.message);
            }
        });
    };

    /**
     * Used to show errors from the service response
     */
    $scope.showErrors = function(title, response) {
        var data = '';
        if(UtilService.isDefined(response.data)) {
            data = response.data.message;
        } else {
            data = 'Error occured while trying to log in';
        }
        
        // check if errorArray is an object, if so send an alert for each item
        if(typeof data === 'object') {
            for(var i = 0; i < data.length; i++) {
                multipleAlerts[multipleAlerts.length] = $alert({
                    'title': title,
                    'content': data[i].msg,
                    'duration': 5,
                    'placement': 'top-right',
                    'show' : true ,
                    'type' : 'danger'
                });
            }
        } else {
            // else just show the message
            $alert({
                'title': title,
                'content': data,
                'duration': 5,
                'placement': 'top-right',
                'show' : true ,
                'type' : 'danger'
            });
        }
    };

    $scope.logOut = function() {
        StorageService.clearAll();
        $state.go('auth', {});
    };
});