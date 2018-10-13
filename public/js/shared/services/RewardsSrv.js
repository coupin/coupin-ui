angular.module('RewardsSrv', ['ngSessionStorage']).factory('RewardsService', [
    '$http',
    'ENV_VARS',
    'StorageService',
    function (
        $http,
        ENV_VARS,
        StorageService
    ) {
        var token = StorageService.getToken();
        var authHeader = {
            'x-access-token': token
        };
        var baseV1Url = ENV_VARS.apiUrl;

        return {
            activate: function (id) {
                return $http.post(baseV1Url + '/rewards/activate/' + id);
            },
            create: function (details) {
                return $http.post(baseV1Url + '/rewards', details, {
                    headers: authHeader
                });
            },
            deactivate: function (id) {
                return $http.post(baseV1Url + '/rewards/deactivate/' + id);
            },
            delete: function (id) {
                return $http.post(baseV1Url + '/rewards/' + id);
            },
            getMerchRewards: function (details) {
                return $http({
                    method: 'GET',
                    url: baseV1Url + '/rewards',
                    params: details,
                    headers: authHeader
                });
            },
            getReward: function (id) {
                return $http.get(baseV1Url + '/rewards/' + id, {
                    headers: authHeader
                });
            },
            update: function(id, details) {
                return $http.put(baseV1Url + '/rewards/' + id, details,  {
                    headers: authHeader
                });
            },
            updateReview: function(id, details) {
                return $http.post(baseV1Url + '/rewards/status/' + id, details,  {
                    headers: authHeader
                });
            }
        }
    }
]);