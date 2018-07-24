angular.module('AuthCtrl', []).controller('AuthController', function(
    $scope,
    $http,
    $location,
    $state,
    $window,
    $alert,
    config,
    MerchantService,
    AuthService,
    StorageService,
    UtilService
) {
    // scope variable to hold form data
    $scope.formData = {};

    
    // to show error and loading
    var amount = 0;
    var plan = 'payAsYouGo';
    $scope.loading = [false, false];
    $scope.planIndex = 0;
    $scope.showError = false;

    // States
    $scope.states = ['lagos'];

    // Get current merchant if merchant route called
    if($location.absUrl().includes('confirm')) {
        const strings = $location.absUrl().match(/\w+/g);
        const merchId = strings[strings.length - 2];

        if (merchId && merchId.length === 24) {
            MerchantService.confirm(merchId).then(function(response) {
                $scope.user = response.data;
                console.log(response.data);
            }).catch(function(err) {
                $scope.showErrors('Retrieval Failed', err.data.message);
            });
        } else {
            UtilService.showError('Uh Oh', 'Invalid id.');
        }
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

    // Add selected category to Object
    $scope.addCat = (x) => {
        if($scope.categories[x] === false) {
            $scope.categories[x] = true;
        } else {
            $scope.categories[x] = false;
        }
    };

    function setUserInfo(data) {
        StorageService.setToken(data.token);
        StorageService.setUser(data.user);
        $scope.user = data.user;
    }

    // For Admin Login
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
                setUserInfo(response.data);
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

    $scope.planCheck = function(index) {
        return $scope.planIndex === index;
    };

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

     function makePayment() {
         var date = new Date();
        var handler = PaystackPop.setup({
            key: config.paystackId,
            email: $scope.user.email,
            amount: amount * 100,
            ref: `${plan}-${merchId}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
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

     function updateUser() {
         $scope.loading[1] = true;
         MerchantService.complete(merchId, $scope.formData).then(function(response){
            // Get response data
            let data = response.data;

            // Show loading icon/screen
            $scope.loading[1] = false;

            // Handle service response
            UtilService.showSuccess('Confirmation Success', data.message);
            $window.location.href = '/merchant/register';
        }).catch(function(err){
            $scope.loading[1] = false;
            UtilService.showError('Confirmation Failed', err.data);
        });
     }

    /**
     * Used to complete merchants registration
     */
    $scope.completeMerch = () => {
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

    /**
     * Logs merchant into the system
     */
    $scope.loginMerch = () => {
        let details = {
            email : $scope.formData.loginEmail,
            password : $scope.formData.loginPassword
        };

        AuthService.signinM(details).then(function(response) {
            setUserInfo(response.data);
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
            console.log(response);
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