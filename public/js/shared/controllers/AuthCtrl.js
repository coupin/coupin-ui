angular.module('AuthCtrl', []).controller('AuthController', function(
    $scope,
    $http,
    $timeout,
    $location,
    $state,
    $window,
    $alert,
    ENV_VARS,
    MerchantService,
    AuthService,
    StorageService,
    PaymentService,
    UtilService,
    ConfigService
) {
    // scope variable to hold form data
    $scope.formData = {};

    const strings = $location.absUrl().match(/\w+/g);
    
    
    // to show error and loading
    var amount = 0;
    var confirmed = false;
    var checkAuth = true;
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
    var url = window.location.origin;
    /**
     * {
     *  enabled: boolean,
     *  endDate: date,
     *  duration: number,
     * }
     */
    $scope.trialPeriodData = {};


    /* this is for switching pages in the merchant auth area */
    $scope.activeView = 'signin';

    $scope.switchActiveView = function (view) {
        $scope.activeView = view;
    }
    /* end of switching pages in the merchant auth area */
    
    // States
    $scope.states = ['Abuja', 'Lagos', 'Rivers State'];
    
    // Get current merchant if merchant route called
    if($location.absUrl().includes('confirm')) {
        checkAuth = false;
        merchId = strings[strings.length - 2];

        ConfigService.getConfig().then(function (res) {
            var config = res.data;
            $scope.trialPeriodData = config.trialPeriod || {};

            if ($scope.trialPeriodData.enabled) {
                $scope.planIndex = 3;
                var plan = 'trial';
            }
        });
        
        if (merchId && merchId.length === 24) {
            MerchantService.confirm(merchId).then(function(response) {
                $scope.user = response.data;
            }).catch(function(err) {
                console.log(err);
                $scope.showErrors('Retrieval Failed', err.data);
            });
        } else {
            UtilService.showError('Uh Oh', 'Invalid id.');
        }
    }
    
    // Confirm Id if for change of password
    if($location.absUrl().includes('forgot-password')) {
        checkAuth = false;
        var encodedString = UtilService.getQueryVariable('query');

        AuthService.confirmEncodedString(encodedString).then(function(result) {
            confirmed = true;
            merchId = result.data.id;
        }).catch(function(err) {
            if (err.status === 500) {
                UtilService.showError('Uh Oh', 'Could not confirm id. Please contact us at care@coupinapp.com');
            } else {
                UtilService.showError('Uh Oh', err.data);
            }
        });
    }

    if (checkAuth && StorageService.isLoggedIn()) {
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
        if (setExpiration && data.user.merchantInfo.billing.history[0]) {
            var expirationDate = data.user.merchantInfo.billing.history[0].expiration;
            StorageService.setExpired(moment(expirationDate).isBefore());
        }
        StorageService.setIsMerchant(setExpiration);
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
        const paymentObject = {
            callbackUrl: url + '/auth',
            amount: amount,
            email: $scope.user.email,
            type: 'billing',
            billingPlan: plan,
            companyName: $scope.user.merchantInfo.companyName,
            userId: $scope.user._id,
        };

        PaymentService.initiatePayment(paymentObject).then(function (result) {
            var authorizationUrl = result.data['authorization_url'];
            UtilService.showInfo('Hey!', 'You\'ll be redirected to a payment page to pay for the billing');
            $timeout(function () {
                window.location = authorizationUrl;
            }, 3000)
        });
     }

     /**
      * Update user data
      */
     function updateUser() {
        $scope.loading[1] = true;
        return MerchantService.complete(merchId, $scope.formData)
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
                updateUser().then(function () {
                    UtilService.showSuccess('Confirmation Success', data.message);
                    $window.location.href = '/auth';
                });
                break;
            case 1:
            case 2:
                updateUser().then(function(response) {
                    // Get response data
                    let data = response.data;

                    // Show loading icon/screen
                    $scope.loading[1] = false;

                    // Handle service response
                    UtilService.showSuccess('Confirmation Success', data.message);
                    makePayment();
                }).catch(function(err){
                    $scope.loading[1] = false;
                    UtilService.showError('Confirmation Failed', 'Your information failed to update, please check connection and try again.');
                });
                break;
            case 3:
                // for the free trial option
                $scope.formData['billing'] = {
                    plan: 'trial',
                    date: new Date(),
                    reference: $scope.trialPeriodData.duration + '-months-trial-complete-registration',
                    expiration: moment(new Date()).add($scope.trialPeriodData.duration, 'months').toDate(),
                };
                updateUser().then(function () {
                    UtilService.showSuccess('Confirmation Success', data.message);
                    $window.location.href = '/auth';
                });
                break;
            default:
                UtilService.showError('Please select Valid Plan', 'Please select a valid billing plan!');
        }
    };

    $scope.submitPassword = function() {
        $scope.loading[1] = true;
        if ($scope.formData.password === $scope.formData.password2) {
            AuthService.changePassword(merchId, $scope.formData.password, encodedString).then(function(result) {
                UtilService.showSuccess('Success!', 'Password change successful.');
                $scope.loading[1] = false;
                $scope.formData = {};
                // $window.location.href="/auth"
            }).catch(function(err) {
                $scope.loading[1] = false;
                UtilService.showError('Uh Oh', err.data);
            });
        } else {
            $scope.loading[1] = false;
            UtilService.showError('Uh Oh', 'Passwords do not match. Please try again');
        }
    };

    $scope.submitPasswordResetRequest = function() {
        $scope.loading[1] = true;
        if ($scope.formData.resetPasswordEmail) {
            AuthService.requestPasswordChange($scope.formData.resetPasswordEmail).then(function(result) {
                UtilService.showSuccess('Success!', 'Request sent successful.');
                $scope.loading[1] = false;
                $scope.formData = {};
            }).catch(function(err) {
                $scope.loading[1] = false;
                UtilService.showError('Uh Oh', err.data);
            });
        } else {
            $scope.loading[1] = false;
            UtilService.showError('Uh Oh', 'Please enter your email!');
        }
    };

    $scope.goToPasswordResetRequestPage = function () {
        $window.location.href = '/auth/request-password-change';
    }

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
                        url: response.data.secure_url
                    };
                } else {
                    $scope.formData['banner'] = {
                        id: response.data.public_id,
                        url: response.data.secure_url
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
        $scope.loading[0] = true;

        AuthService.signinM(details).then(function(response) {
            setUserInfo(response.data, true);
            $scope.loading[0] = false;
            $state.go('dashboard.home', {});
        }).catch(function(err) {
            $scope.loading[0] = false;
            UtilService.showError('Request Failed', err.data);
        });
    }

    /**
     * Used to register a merchant after they have been approved
     */
    $scope.registerMerch = () => {
        // Hide any existing alert
        // hideAllAlerts();
        
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
                /* multipleAlerts[multipleAlerts.length] = $alert({
                    'title': title,
                    'content': data[i].msg,
                    'duration': 5,
                    'placement': 'center-center',
                    'show' : true ,
                    'type' : 'danger'
                }); */
                UtilService.showError(title, data[i].msg)
            }
        } else {
            // else just show the message
            UtilService.showError(title, data);
        }
    };

    $scope.logOut = function() {
        StorageService.clearAll();
        $state.go('auth', {});
        $window.location.reload();
    };

    $scope.isError = function (x) {
        return UtilService.isError(x);
    };
});