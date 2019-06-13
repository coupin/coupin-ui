angular.module('RewardsCtrl', []).controller('RewardsController', function (
    $scope,
    $state,
    ENV_VARS,
    MerchantService,
    RewardsService,
    StorageService,
    Upload,
    UtilService
) {
    const expires = ($scope.user.merchantInfo.billing.history[0] && moment($scope.user.merchantInfo.billing.history[0].expiration)) || true;
    const id = $state.params.id;
    const errTitle = 'Error!';
    const errMsg = 'Something went wrong on our end. Please try again.';
    const plan = $scope.user.merchantInfo.billing.plan;

    var amount = 0;
    var showTotal = true;


    // could either be all, weekdays or weekends
    $scope.selectedDayOption = '';

    $scope.activeRewards = [];
    $scope.inactiveRewards = [];
    $scope.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    $scope.bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    $scope.files = [];
    $scope.image = {
        src: null,
        dst: null
    };
    $scope.maxDays = 30;
    $scope.minDate = new Date();
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

    if (StorageService.isExpired()) {
        $state.go('dashboard.rewards', {});
    }

    if ($scope.user.merchantInfo.billing.plan !== 'payAsYouGo') {
        showTotal = false;
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
        }).catch(function (error) {
            UtilService.showError(errTitle, error.data);
        });
    } else {
        $scope.newReward = {
            applicableDays: [],
            categories: [],
            multiple: {},
            pictures: [],
            status: showTotal ? 'draft' : 'isPending'
        };
    }

    $scope.isNewReward = function () {
        return !id;
    }

    /**
     * Make payment with paystack
     */
    function payWithPayStack(reward, cb) {
        var date = new Date();
        const reference = `${reward._id}-${$scope.user.merchantInfo.companyName.split(' ')[0]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getTime()}`;

        var handler = PaystackPop.setup({
            key: ENV_VARS.payStackId,
            email: $scope.user.email,
            amount: amount * 100,
            ref: reference,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Reward Name",
                        variable_name: "The name of the reward",
                        value: `${reward.name}`
                    }
                ]
            },
            callback: function (response) {
                if (cb && typeof cb === 'function') {
                    cb(response.reference);
                }
            },
            onClose: function () {
                $scope.loading = false;
                UtilService.showInfo('Payment Cancelled', 'Pay when you are ready.');
            }
        });
        handler.openIframe();
    };

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
        return ((oldPrice - newPrice) / oldPrice) * 100;
    };

    /**
     * Create new reward
     * @param {Object} reward 
     */
    $scope.createReward = function (reward) {
        const bill = plan === 'payAsYouGo';
        $scope.loading = true;
        RewardsService.create(reward).then(function (result) {
            $scope.newReward = result.data;
            $scope.loading = false;
            if ($scope.files.length > 0) {
                $scope.upload(result.data._id, function () {
                    if (bill) {
                        UtilService.showSuccess('Success', 'Reward Created Successfully as a Draft until payment is complete..');
                        $scope.makePayment(result.data);
                    } else {
                        UtilService.showSuccess('Success', 'Reward Created Successfully. An admin will review it in the next 24hours or less.');
                        $state.go('dashboard.reward', {});
                    }
                });
            } else if (plan === 'payAsYouGo') {
                UtilService.showSuccess('Success', 'Reward Created Successfully as a Draft until payment is complete..');
                $scope.makePayment(result.data);
            } else {
                UtilService.showSuccess('Success', 'Reward Created Successfully. An admin will review it in the next 24hours or less.');
                $state.go('dashboard.rewards', {});

            }
        }).catch(function (err) {
            $scope.loading = false;
            UtilService.showError(errTitle, errMsg);
        })
    };

    function setSelectedDayOption () {
        var weekends = [5, 6];

        var isWeekend = $scope.newReward.applicableDays.length === 2 &&
            $scope.newReward.applicableDays.every(function (x) { return weekends.includes(x); });

        var isWeekday = $scope.newReward.applicableDays.length === 5 &&
            $scope.newReward.applicableDays.every(function (x) { return !weekends.includes(x); });

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
        var limit = 200000;

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

            var file = new File([u8arr], `${$scope.photos.length}`, { type: mime });

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

    /**
     * Get total cost
     * @param {number} days 
     */
    $scope.getTotal = function (days) {
        if (days) {
            amount = days > 7 ? days * 450 : days * 500;
        }
        return amount;
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
        payWithPayStack(reward, function (response) {
            MerchantService.updateBilling($scope.user.id, {
                plan: 'payAsYouGo',
                reference: response.reference
            }).then(function (response) {
                StorageService.setUser(response.data);
                reward.status = 'isPending';
                reward.isActive = true;
                $scope.updateReward(reward);
                $scope.loading = false;
                UtilService.showSuccess('Success', `Billing Updated!`);
            })
                .catch(function () {
                    $scope.loading = false;
                    UtilService.showError('Uh Oh', 'There was an error while saving payment. please contact admin on admin@coupin.com');
                });
        });
    };

    $scope.payRewardIsActive = function () {
        return $scope.newReward.status !== 'draft' && plan === 'payAsYouGo';
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
        if (!showTotal) {
            $scope.maxDays = expires.diff(new Date($scope.newReward.startDate), 'days');
        }
        $scope.newReward.endDate = moment($scope.newReward.startDate).add(days, 'day').toDate();
    };

    $scope.showReviews = function () {
        return $scope.newReward.review && $scope.newReward.review.length > 0 && $scope.newReward.status === 'review';
    };

    $scope.showTotal = function () {
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
                var count = 0;

                resp.data.forEach(function (data) {
                    var total = $scope.photos.length;
                    var found = false;

                    while (count < total && !found) {
                        if ($scope.photos[count].url.includes('data')) {
                            $scope.photos[count] = data;
                            found = true;
                        }
                        count++;
                    }
                });

                $scope.newReward.pictures = $scope.photos;
                $scope.uploading = false;
                $scope.updateReward($scope.newReward);
                if (cb) {
                    cb();
                }
            }, function (err) {
                $scope.uploading = false;
                UtilService.showError('Uh Oh!', 'Your reward images failed to upload. Please try again.');
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.progress = progressPercentage;
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
});