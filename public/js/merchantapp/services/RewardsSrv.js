angular.module('RewardsSrv', ['ngSessionStorage']).factory('RewardsService', [
    '$http',
    'StorageService',
    function (
        $http,
        StorageService
    ) {
        var token = StorageService.getToken();
        var authHeader = {
            'x-access-token': token
        };
        var baseV1Url = 'http://localhost:5030/api/v1';

        return {
            activate: function (id) {
                return $http.post(baseV1Url + '/reward/activate/' + id);
            },
            create: function (details) {
                return $http.post(baseV1Url + '/reward', details, {
                    headers: authHeader
                });
            },
            deactivate: function (id) {
                return $http.post(baseV1Url + '/reward/deactivate/' + id);
            },
            delete: function (id) {
                return $http.post(baseV1Url + '/reward/' + id);
            },
            getMerchRewards: function (details) {
                return $http({
                    method: 'GET',
                    url: baseV1Url + '/reward',
                    params: details,
                    headers: authHeader
                });
            },
            getReward: function (id) {
                return $http.get(baseV1Url + '/reward/' + id);
            },
            update: function(id, details) {
                return $http.put(baseV1Url + '/reward/' + id, details,  {
                    headers: authHeader
                });
            }
        }
    }
]);