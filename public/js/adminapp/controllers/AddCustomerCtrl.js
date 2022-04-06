angular.module('AddCustomerCtrl', []).controller('AddCustomerController', function (
    $scope,
    $state,
    customerId,
    UtilService
) {
    // test customer 
    const customer = {
        name: 'Arinze Obi',
        email: 'me@arinzeobi.com',
        mobileNumber: '09087654653',
        address: 'Olufemi Adeniyi Crescent',
        ageRange: '15 - 25',
        sex: 'male',
        picture: 'https://githubcontent.com/images/arinze19/1.jpg',
        city: 'Gbagada',
        locations: ['6.556276', '3.3805357'],
        bookings: '',
        referralsCount: 36,
        referrer: {
            name: 'Akintunde Ayomide'
        },
        picture: {
            id: 1,
            url: 'https://avatars.githubusercontent.com/u/41495197'
        },
        referralCode: 'BNXN',
        accountDetails: {
            accountName: 'Arinze Obi Josiah',
            accountNumber: 2091638865,
            bankName: 'United Bank Africa'
        }
    }
    let isEdit = false;

    $scope.loading = false;
    $scope.preview = customer.picture.url ? customer.picture.url : '';
    $scope.isEdit = function() {
        return isEdit
    }

    $scope.navigateToList = function () {
        $state.go('portal.view-customers', {});
    };

    $scope.customer = {}
    $scope.formData = {}


    const api = new Promise((res) => res(customer))
    const call = () => setTimeout(() => {
        api.then(customer => {
            $scope.customer = customer
            $scope.loading = false
            $scope.formData = { ...customer }

            $scope.$digest()
        })

    }, 3000)

    if (UtilService.isDefined(customerId)) {
        $scope.loading = true;
        isEdit = true; 
        call()
    }
});