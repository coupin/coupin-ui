angular.module('RewardsCtrl', []).controller('RewardsController', function (
    $scope,
    $alert,
    $state,
    RewardsService,
    Upload,
    UtilService
) {
    const id = $state.params.id;
    const errTitle = 'Error!';
    const errMsg = 'Something went wrong on our end. Please try again.';

    var selectAll = false;
    var weekDays = false;
    var weekEnds = false;

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
    $scope.photos = [];
    $scope.deletePhotos = [];
    $scope.update = false;
    $scope.loading = false;
    $scope.uploading = false;

    if (id) {
        $scope.categories = {};
        $scope.update = true;
        RewardsService.getReward(id).then(function(result) {
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
        }).catch(function(error) {
            console.log(error);
            showError(errTitle, errMsg);
        });
    } else {
        $scope.newReward = {
            applicableDays: [],
            categories: [],
            multiple: {},
            pictures: []
        };
    }

    $scope.loading = false;

    $scope.activeRewards = [];
    $scope.inactiveRewards = [];
    $scope.daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    $scope.addCat = function (category) {
        if ($scope.newReward.categories.indexOf(category) == -1) {
            $scope.newReward.categories.push(category);
        } else {
            $scope.newReward.categories.splice($scope.newReward.categories.indexOf(category), 1);
        }
    };

    $scope.addReward = function() {
        // $location.url('/merchant/rewards');
    };

    $scope.deleteReward = function(id) {
        RewardsService.delete(id).then(function(response) {
            // $location.url('/merchant');
        }).catch(function(error) {
            console.log(error);
            showError(errTitle, error.data.message);
        });
    };

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
            showError('Uh Oh!', 'You can only have 4 Reward Pictures at a time.');
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
                showError('Uh Oh!', `File is too large, must be ${limit}KB or less.`);
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

    $scope.removeImage = function(index) {
        if ('id' in $scope.photos[index]) {
            $scope.deletePhotos.push($scope.photos[index].id);
        }

        $scope.files.splice(index, 1);
        $scope.photos.splice(index, 1);
    };

    $scope.upload = function(id, redirect) {
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

                $alert({
                    'title' : 'Success',
                    'content' : 'Your Pictures were uploaded successfully.',
                    'type' : 'success',
                    'duration' : 5,
                    'placement' : 'top-right',
                    'show' : true
                });
                setTimeout(function() {
                    $scope.uploading = false;
                    $scope.updateReward($scope.newReward);
                }, 2000);
            }, function(err) {
                $scope.uploading = false;
                showError('Uh Oh!', 'Your reward images failed to upload. Please try again.');
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.progress = progressPercentage;
            }).catch(function(err) {
                $scope.uploading = false;
                showError('Uh Oh!', 'Your pictures failed to upload. Please try again.')
            });
        }
    };

    // Check all the days of the week
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

    // Check weekdays
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

    // Check weekends
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

    // Check the day of the week
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
     * Submit form for a new Reward
     */
    $scope.createReward = function (reward) {
        $scope.loading = true;
        RewardsService.create(reward).then(function (result) {
            $alert({
                'title' : 'Success',
                'content' : 'Reward Created Successfully',
                'type' : 'success',
                'duration' : 5,
                'placement' : 'top-right',
                'show' : true
            });
            $scope.newReward = result.data;
            $scope.loading = false;
            $scope.upload(result.data._id, true);
        }).catch(function (err) {
            $scope.loading = false;
            showError(errTitle, errMsg);
        })
    };

    $scope.updateReward = function (reward, upload) {
        $scope.loading = true;
        RewardsService.update(reward._id, reward).then(function(response) {
            if ($scope.deletePhotos.length > 0) {
                UtilService.deletePhotos($scope.deletePhotos);
            }

            $alert({
                'title' : 'Success',
                'content' : 'Your Reward updated successfully.',
                'type' : 'success',
                'duration' : 5,
                'placement' : 'top-right',
                'show' : true
            });
            $scope.loading = false;
        }).catch(function(error) {
            console.log(error);
            showError('Uh Oh!', error.message);
            $scope.loading = false;
        });
    };

    // TODO: Remove
    /**
     * Load a reward or route to reward page
     */
    $scope.loadReward = function (id) {
        if (id === undefined) {
            // const _id = $location.search().id;
            RewardsService.getReward(_id).then(function (result) {
                if (result.status === 200) {
                    $scope.reward = result.data;
                } else {
                    showError(errTitle, errMsg);
                }
            }).catch();
        } else {
            // $location.url('/reward?id=' + id);
        }

    };

    const showError = function (title, msg) {
        $alert({
            'title': title,
            'content': msg,
            'duration': 5,
            'placement': 'top-right',
            'show' : true ,
            'type' : 'danger'
        });
    };
});