angular.module('RewardsCtrl', []).controller('RewardsController', function (
    $scope,
    $state,
    $timeout,
    ENV_VARS,
    PaymentService,
    MerchantService,
    BankService,
    RewardsService,
    StorageService,
    Upload,
    UtilService
) {
    $scope.user = StorageService.getUser();
    const expires = ($scope.user.merchantInfo.billing.history[0] && moment($scope.user.merchantInfo.billing.history[0].expiration)) || true;
    const id = $state.params.id;
    const errTitle = 'Error!';
    const errMsg = 'Something went wrong on our end. Please try again.';
    const plan = $scope.user.merchantInfo.billing.plan;

    $scope.amount = 0;
    var isPayAsYouGo = true;

    // could either be all, weekdays or weekends
    $scope.selectedDayOption = '';

    $scope.activeRewards = [];
    $scope.inactiveRewards = [];
    $scope.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.bounds = {
        left: 0,
        // right: 0,
        top: 0,
        // bottom: 0
    };
    $scope.files = [];
    $scope.image = {
        src: null,
        dst: null
    };
    $scope.maxDays = 30;

    var cutOffTime = moment().startOf('day').add(23, 'hours').add(30, 'minutes'); // set the date to today 5pm
    if (moment().isBefore(cutOffTime)) {
        $scope.minDate = new Date();
    } else {
        $scope.minDate = moment().add(1, 'days').toDate();
    }
    $scope.photos = [];
    $scope.deletePhotos = [];
    $scope.newReward = {
        status: 'draft'
    };
    $scope.update = false;
    $scope.loading = false;
    $scope.uploading = false;

    $scope.plans = [{
        display: 'Days',
        value: 0
    }, {
        display: 'Weeks',
        value: 1
    }, {
        display: 'Months',
        value: 2
    }, {
        display: 'Years',
        value: 3
    }];

    $scope.bankInfo = {
        accountNumber: '',
        accountBank: '',
    };

    $scope.customerAccountDetails = null;

    $scope.showSaveAccount = false;
    $scope.confirmAccountLoading = false;
    $scope.accountConfirmationError = '';

    var url = window.location.origin;

    if (StorageService.isExpired()) {
        $state.go('dashboard.rewards', {});
    }

    if ($scope.user.merchantInfo.billing.plan !== 'payAsYouGo') {
        isPayAsYouGo = false;
        $scope.maxDays = expires.diff(new Date(), 'days');
        $scope.maxDate = expires.toDate();
    } else {
        $scope.maxDate = moment().add(365, 'day').toDate();
    }

    if (id) {
        $scope.categories = {};
        $scope.update = true;
        RewardsService.getReward(id).then(function (result) {
            $scope.newReward = result.data;
            $scope.newReward.endDate = new Date($scope.newReward.endDate);
            $scope.newReward.startDate = new Date($scope.newReward.startDate);
            setSelectedDayOption ();
            $scope.newReward.categories.forEach(function (category) {
                $scope.categories[category] = true;
            });
            $scope.newReward.pictures = 'pictures' in $scope.newReward ? $scope.newReward.pictures : [];
            $scope.photos = $scope.newReward.pictures;
            $scope.noOfDays = moment($scope.newReward.endDate).diff(moment($scope.newReward.startDate), 'days');
            $scope.amount = getTotal($scope.noOfDays);
            $scope.maxDays = expires.diff(new Date($scope.newReward.startDate), 'days');
        }).catch(function (error) {
            UtilService.showError(errTitle, error.data);
        });
    } else {
        $scope.newReward = {
            applicableDays: [],
            categories: [],
            multiple: {},
            pictures: [],
            status: 'isPending'
        };
    }

    function hasAccountDetails() {
        const accountDetails = $scope.user.merchantInfo.accountDetails
        const accountKeys = Object.keys(accountDetails);

        const values = ['accountNumber',
        'bankName',
        'accountName',
        'bankCode'].every((field) => accountDetails[field]);

        return accountKeys.length > 0 && values
    }

    BankService.getBanks()
        .then(({ data }) => {
            $scope.banks = data.banks;
        });

    $scope.isNewReward = function () {
        return !id;
    }

    $scope.addCat = function (category) {
        if ($scope.newReward.categories.indexOf(category) == -1) {
            $scope.newReward.categories.push(category);
        } else {
            $scope.newReward.categories.splice($scope.newReward.categories.indexOf(category), 1);
        }
    };

    $scope.addReward = function () {
        // $location.url('/merchant/rewards');
    };

    /**
     * Calculate percentage discount
     * @param {number} oldPrice 
     * @param {number} newPrice 
     */
    $scope.calculatePercentage = function (oldPrice, newPrice) {
        if (oldPrice && newPrice && !isNaN(oldPrice) && !isNaN(newPrice)) {
            $scope.commission = $scope.newReward.customerBearsCost ? $scope.commission : $scope.newReward.price.new * 0.03;
            $scope.oldPriceDifference = $scope.newReward.price.old * 0.03;

            if ($scope.commission < 200) {
                $scope.commission = 200;
            } else if ($scope.commission > 3500) {
                $scope.commission = 3500;
            }

            return ((oldPrice - newPrice) / oldPrice) * 100;
        } else if (newPrice) {
            $scope.commission = $scope.newReward.price.new * 0.03;
            console.log('Initial Commission ==> ', $scope.commission)
            if ($scope.commission < 200) {
                $scope.commission = 200;
            } else if ($scope.commission > 3500) {
                $scope.commission = 3500;
            }
        }

        return 0;
    };

    var oldPriceMap = {
        old: '',
        new: ''
    };

    $scope.customerBearsCostChange = function () {
        if ($scope.newReward.price.old && $scope.newReward.price.new) {
            if ($scope.newReward.customerBearsCost) {
                oldPriceMap.old = $scope.newReward.price.old;
                oldPriceMap.new = $scope.newReward.price.new;

                // $scope.newReward.price.old = parseInt($scope.newReward.price.old, 10) + $scope.commission;
                $scope.newReward.price.new = parseInt($scope.newReward.price.new, 10) + $scope.commission;

                // Delete after confirming that it's fine
                // if ($scope.commission < 200) {
                //     $scope.commission = 200;
                //     $scope.newReward.price.old = parseInt($scope.newReward.price.old, 10) + 200;
                //     $scope.newReward.price.new = parseInt($scope.newReward.price.new, 10) + 200;
                // } else if ($scope.commission > 3500) {
                //     $scope.commission = 3500;
                //     $scope.newReward.price.old = parseInt($scope.newReward.price.old, 10) + 3500;
                //     $scope.newReward.price.new = parseInt($scope.newReward.price.new, 10) + 3500;
                // } else {
                //     $scope.newReward.price.old = parseInt($scope.newReward.price.old, 10) + $scope.oldPriceDifference;
                //     $scope.newReward.price.new = parseInt($scope.newReward.price.new, 10) + $scope.commission;
                // }
            } else {
                // $scope.newReward.price.old = oldPriceMap.old;
                $scope.newReward.price.new = oldPriceMap.new;
            }
        }
    };

    $scope.$watch('newReward.price.new', function (val) {
        if (val) {
            if ($scope.newReward.customerBearsCost) {
                $scope.payoutAmount = val - $scope.commission;
            } else {
                $timeout(function () {
                    if ($scope.commission === 200) {
                        $scope.payoutAmount = val - 200;
                    } else if ($scope.commission === 3500) {
                        $scope.payoutAmount = val - 3500;
                    } else {
                        $scope.payoutAmount = val * 0.97;
                    }
                });
            }
        } else {
            $scope.payoutAmount = 0;
        }
    });

    /**
     * Create new reward
     * @param {Object} reward 
     */
    $scope.createReward = function (reward) {
        $scope.loading = true;
        RewardsService.create(reward).then(function (result) {
            $scope.newReward = result.data;
            $scope.loading = false;
            if ($scope.files.length > 0) {
                $scope.upload(result.data._id, function () {
                    UtilService.showSuccess('Success', 'Reward Created Successfully. An admin will review it in the next 24hours or less.');

                    if (!hasAccountDetails()) {
                        $('#accountInfoModal').modal('show');
                    } else {
                        $state.go('dashboard.rewards', {});
                    }
                });
            } else {
                UtilService.showSuccess('Success', 'Reward Created Successfully. An admin will review it in the next 24hours or less.');
                if (!hasAccountDetails()) {
                    $('#accountInfoModal').modal('show');
                } else {
                    $state.go('dashboard.rewards', {});
                }
            }

        }).catch(function (err) {
            $scope.loading = false;
            UtilService.showError(errTitle, errMsg);
        })
    };

    function setSelectedDayOption () {
        var weekends = [5, 6];

        var isWeekend = $scope.newReward.applicableDays.length === 2 &&
            $scope.newReward.applicableDays.every(function (x) { return weekends.indexOf(x) > -1; });

        var isWeekday = $scope.newReward.applicableDays.length === 5 &&
            $scope.newReward.applicableDays.every(function (x) { return !weekends.indexOf(x) > -1; });

        if ($scope.newReward.applicableDays.length === 7) {
            $scope.selectedDayOption = 'all';
        } else if (isWeekend) {
            $scope.selectedDayOption = 'weekends';
        } else if (isWeekday) {
            $scope.selectedDayOption = 'weekdays';
        } else {
            $scope.selectedDayOption = '';
        }
    }

    /**
     * Check a particular day of the week
     * @param {String} dayNumber
     */
    $scope.day = function (dayNumber) {
        
        if ($scope.newReward.applicableDays.indexOf(dayNumber) !== -1) {
            $scope.newReward.applicableDays.splice($scope.newReward.applicableDays.indexOf(dayNumber), 1);
        } else {
            $scope.newReward.applicableDays.push(dayNumber)
        }

        setSelectedDayOption ();
    };

    /**
     * Delete a reward
     * @param {String} id 
     */
    $scope.deleteReward = function (id) {
        RewardsService.delete(id).then(function (response) {
            // $location.url('/merchant');
        }).catch(function (error) {
            UtilService.showError(errTitle, error.data.message);
        });
    };

    /**
     * Display creation button
     */
    $scope.displayCreateButton = function () {
        return !$scope.update;
    };

    /**
     * Display Pay and Update button
     */
    $scope.displayPayAndUpdateButton = function () {
        return $scope.update && plan === 'payAsYouGo' && $scope.newReward.status === 'draft';
    };

    /**
     * Display update button
     */
    $scope.displayUpdateButton = function () {
        return $scope.update && $scope.newReward.status !== 'draft';
    };

    /**
     * Return boolean to determine whether or not to show reward photos
     */
    $scope.displayRewardPhotos = function () {
        return $scope.photos.length > 0;
    };

    /**
     * Check file and make upload
     * @param {*} image 
     */
    $scope.fileCheck = function (image) {
        // var limit = 200000;
        var limit = 1000000;
        var file;

        if ($scope.photos.length === 4) {
            $('#croppingModal').modal('hide');
            UtilService.showError('Uh Oh!', 'You can only have 4 Reward Pictures at a time.');
        } else if (UtilService.isDefined(image.src)) {
            isuploading = true;
            var dataurl = image.dst;
            var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
                bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
            while (n--) {
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
                UtilService.showError('Uh Oh!', 'File is too large, must be ' + limit + 'KB or less.');
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

    /**
     * Get total cost
     * @param {number} days 
     */
    function getTotal (days) {
        if (!days) days = 0;
        return parseInt(days, 10) > 7 ? parseInt(days, 10) * 425 : days * 500;
    };

    $scope.isError = function (x) {
        return UtilService.isError(x);
    };


    $scope.isFormError = function (x) {
        return UtilService.isFormError(x) || $scope.newReward.applicableDays.length <= 0 || $scope.newReward.categories.length <= 0;
    };

    /**
     * Make payment for the reward
     * @param {Object} reward 
     */
    $scope.makePayment = function (reward) {
        $scope.loading = true;
        var rewardId = reward._id || reward.id;
        const paymentObject = {
            callbackUrl: url + '/dashboard/rewards',
            amount: $scope.amount,
            email: $scope.user.email,
            type: 'reward',
            companyName: $scope.user.merchantInfo.companyName,
            userId: $scope.user.id,
            reward: {
                id: rewardId,
                name: reward.name,
            },
        };

        PaymentService.initiatePayment(paymentObject).then(function (result) {
            var authorizationUrl = result.data['authorization_url'];
            UtilService.showInfo('Hey!', 'You\'ll be redirected to a payment page to pay for the reward');
            $timeout(function () {
                window.location = authorizationUrl;
            }, 1500)
        });
    };

    $scope.payRewardIsActive = function () {
        return $scope.newReward.status !== 'isPending' && plan === 'payAsYouGo';
    };

    /**
     * Remove images and mark them uploaded
     * images for deletion
     * @param {*} index 
     */
    $scope.removeImage = function (index) {
        if ('id' in $scope.photos[index]) {
            $scope.deletePhotos.push($scope.photos[index].id);
        }

        $scope.files.splice(index, 1);
        $scope.photos.splice(index, 1);
    };

    $scope.setEndDate = function (days) {
        if (!isPayAsYouGo) {
            $scope.maxDays = expires.diff(new Date($scope.newReward.startDate), 'days') || 0;
        }
        $scope.newReward.endDate = moment($scope.newReward.startDate).add(days, 'day').toDate();

        $scope.amount = getTotal(days);
    };

    $scope.showReviews = function () {
        return $scope.newReward.review && $scope.newReward.review.length > 0 && $scope.newReward.status === 'review';
    };

    $scope.showTotal = function () {
        return $scope.user.merchantInfo.billing.plan === 'payAsYouGo';
    };

    $scope.isPayAsYouGo = function () {
        return $scope.user.merchantInfo.billing.plan === 'payAsYouGo';
    };

    /**
     * Upload images
     * @param {*} id 
     */
    $scope.upload = function (id, cb) {
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
            }).then(function (resp) {
                $scope.uploading = false;
                var count = 0;

                resp.data.forEach(function (data) {
                    var total = $scope.photos.length;
                    var found = false;

                    while (count < total && !found) {
                        if ($scope.photos[count].url.indexOf('data') > -1) {
                            $scope.photos[count] = data;
                            found = true;
                        }
                        count++;
                    }
                });

                $scope.newReward.pictures = $scope.photos;
                $scope.updateReward($scope.newReward);
                if (cb) {
                    cb();
                }
            }, function (err) {
                $scope.uploading = false;
                UtilService.showError('Uh Oh!', 'Your reward images failed to upload. Please try again.');
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            }).catch(function (err) {
                $scope.uploading = false;
                UtilService.showError('Uh Oh!', 'Your pictures failed to upload. Please try again.')
            });
        }
    };

    /**
     * Update existing reward and
     * replace images if any have been uploaded
     * or deleted
     * @param {*} reward 
     * @param {*} upload 
     */
    $scope.updateReward = function (reward) {
        $scope.loading = true;
        RewardsService.update(reward._id, reward).then(function () {
            if ($scope.deletePhotos.length > 0) {
                UtilService.deletePhotos($scope.deletePhotos);
            }

            UtilService.showSuccess('Success', 'Your Reward updated successfully.');
            $scope.loading = false;
        }).catch(function (error) {
            $scope.loading = false;
            UtilService.showError('Uh Oh!', error.data.message);
        });
    };

    $scope.selectGroup = function (x) {
        if ($scope.selectedDayOption === x) {
            $scope.selectedDayOption = '';
            $scope.newReward.applicableDays = [];
            return;
        }

        $scope.selectedDayOption = x;

        if (x === 'all') {
            $scope.newReward.applicableDays = [0, 1, 2, 3, 4, 5, 6];
        } else if (x === 'weekdays') {
            $scope.newReward.applicableDays = [0, 1, 2, 3, 4];
        } else if (x === 'weekends') {
            $scope.newReward.applicableDays = [5, 6];
        }
    }

    $scope.goToRewardList = function () {
        $state.go('dashboard.rewards', {});
    }

    $scope.confirmAccountDetails = function () {
        const { accountNumber, accountBank } = $scope.bankInfo;
        $scope.confirmAccountLoading = true;

        const payload = {
            accountNumber,
            accountBankCode: accountBank.code,
        };

        MerchantService
            .confirmAccountDetails(payload)
            .then(({ data }) => {
                $scope.confirmAccountLoading = false;
                $scope.showSaveAccount = true;

                // save merchants account details here
                $scope.customerAccountDetails = {
                    accountNumber,
                    bankName: accountBank.name,
                    accountName: data.account_name,
                    bankCode: accountBank.code,
                };

                UtilService.showSuccess('Success', 'Account details have been confirmed');
            }).catch((error) => {
                $scope.confirmAccountLoading = false;
                $scope.accountConfirmationError = error.data.message;
                UtilService.showError('Error', error.data.message);

            });
    };

    $scope.saveMerchantAccountDetails = function () {
        MerchantService
            .saveAccountDetails($scope.customerAccountDetails)
            .then(() => {
                UtilService.showSuccess('Success', 'Account details have been stored');
                $('#accountInfoModal').modal('hide');
                MerchantService.refreshUser($scope.user.id);
                $state.go('dashboard.rewards', {});
            }).catch((error) => {
                $scope.accountSavingError = error.data.message;
                UtilService.showError('Error', error.data.message);
            })
    };

    $scope.accountInfoChange = function() {
        $scope.showSaveAccount = false;
    }
});