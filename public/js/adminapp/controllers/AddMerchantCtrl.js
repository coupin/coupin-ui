angular.module('AddMerchantCtrl', []).controller('AddMerchantController', function(
  $scope,
  $state,
  merchantId,
  Upload,
  MerchantService,
  UtilService
) {
    var isEdit = false;
    var upload = false;
    $scope.bounds = {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    };
    $scope.formData = {
        categories: [],
        rating: {
            value: 0,
            raters: 1
        }
    };
    $scope.image = {
        src: null,
        dst: null
    };
    $scope.loading = false;
    $scope.proceeding = false;
    $scope.uploading = false;

    if (UtilService.isDefined(merchantId)) {
        $scope.loading = true;
        MerchantService.retrieve(merchantId).then(function(response) {
            var merchant = response.data;
            isEdit = true;
            $scope.formData = {
                companyName: merchant.merchantInfo.companyName,
                companyDetails: merchant.merchantInfo.companyDetails,
                address: merchant.merchantInfo.address,
                city: merchant.merchantInfo.city,
                email: merchant.email,
                mobileNumber: merchant.merchantInfo.mobileNumber,
                longitude: merchant.merchantInfo.location[0],
                latitude: merchant.merchantInfo.location[1],
                logo: merchant.merchantInfo.logo,
                categories: merchant.merchantInfo.categories || [],
                rating: merchant.merchantInfo.rating
            };
            $scope.preview = merchant.merchantInfo.logo ? merchant.merchantInfo.logo.url : '';
            $scope.loading = false;
        }).catch(function(err) {
            console.log(err);
            $scope.loading = false;
            UtilService.showError(err.data.message);
        });
    }

    /**
     * Upload logos
     * @param {*} data 
     * @param {*} callback 
     */
    function uploadLogo(data, callback) {
        Upload.upload({
            url: '/upload',
            method: 'POST',
            arrayKey: '',
            data: data
        })
        .then(function (response) {
            UtilService.showSuccess('Success', 'Photo uploaded successfully.');
            callback(true, response);
        }).catch(function (error) {
            UtilService.showError('Error', error.data.message);
            callback(false, error);
        });
    };

    /**
     * Create New Merchant
     * @param {Object} data which holds the information such as name, address and so on.
     */
    function createMerchant(data) {
        if (data.password === data.password2) {
            $scope.proceeding = true;

            MerchantService.adminCreate(data)
                .then(function (res) {
                    $scope.proceeding = false;
                    $scope.image.src = null;
                    UtilService.showSuccess('Success', 'Merchant created successfully.');
                    var merchant = res.data;
                    uploadLogo({
                        file: $scope.file,
                        public_id: merchant._id + '-logo'
                    }, function(uploaded, res) {
                        $scope.proceeding = false;
                        if (uploaded) {
                            $scope.updateMerchant(res.data._id, {
                                logo: {
                                    id: response.data.public_id,
                                    url: response.data.url
                                }
                            });
                        }
                    });
                })
                .catch(function (error) {
                    $scope.proceeding = false;
                    UtilService.showError('Error', error.data.message);
                });
        } else {
            UtilService.showError('Error', 'Passwords do not match');
        }
    };

    /**
     * Check if file meets requirements
     */
    $scope.fileCheck = function() {
        var image = $scope.image;
        var limit = 1000000;
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
                showError('Uh Oh!', "File is too large, must be " + limit + "KB or less.");
            } else {
                upload = true;
                $scope.file = file;
                $scope.preview = $scope.image.dst;
                $('#croppingModal').modal('hide');
            }
        } else {
            $('#croppingModal').modal('hide');
            UtilService.showError('Uh Oh!', 'Something went wrong while uploading.');
        }
    };

    /**
     * Returns true when editing a merchant
     * and false otherwise
     */
    $scope.isEdit = function() {
        return isEdit;
    };

    /**
     * Find out if the form field and form are valid
     * @param {FormElement} element 
     */
    $scope.isError = function(element) {
        return UtilService.isError(element);
    };

    $scope.isSelected = function(category) {
        return $scope.formData.categories.indexOf(category) > -1;
    };

    /**
     * Go back to list of merchants
     */
    $scope.navigateToList = function() {
        $state.go('portal.view-merchs', {});
    };

    /**
     * Update Merchant Information
     * @param {String} id merchant's unique id
     * @param {Object} data holding the data you would like to change
     */
    function updateMerchant (id, data) {
        $scope.proceeding = true;
        MerchantService.update(id, data).then(function(res) {
            $scope.proceeding = false;
            UtilService.showSuccess('Success', 'Merchant updated successfully.');
        }).catch(function(err) {
            $scope.proceeding = false;
            UtilService.showError('Error on Updates', err.data.message);
        });
    };

    /**
     * Add or remove category from array of categories
     * @param {*} category 
     */
    $scope.toggleCategory = function(category) {
        var index = $scope.formData.categories.indexOf(category);
        if (index > -1) {
            $scope.formData.categories.splice(index, 1);
        } else {
            $scope.formData.categories.push(category);
        }
    };

    /**
     * Procced to next saving step
     */
    $scope.proceed = function () {
        if (upload && isEdit) {
            $scope.proceeding = true;
            uploadLogo({
                file: $scope.file,
                public_id: merchantId + '-logo'
            }, function(uploaded, response) {
                $scope.proceeding = false;
                if (uploaded) {
                    $scope.formData.logo = {
                        id: response.data.public_id,
                        url: response.data.url
                    };
                    updateMerchant(merchantId, $scope.formData);
                } else {
                    $scope.proceeding = false;
                }
            });
        } else if (isEdit) {
            updateMerchant(merchantId, $scope.formData);
        } else {
            createMerchant($scope.formData);
        }
    };
});