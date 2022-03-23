angular.module('UserSrv', []).factory('UserService', [
    'ENV_VARS',
    '$http',
    'StorageService',
function (
    ENV_VARS,
    $http,
    StorageService
) {
    var baseV1Url = ENV_VARS.apiUrl;
    function getAuthHeader() {
        var token = StorageService.getToken();
        return {
            'x-access-token': token
        };
    }

    return {
        retrieve: function (id = '') {
            return $http.get(baseV1Url + '/customer/' + id, {
                headers: getAuthHeader()
            }) 
        },
        test: function() {
            console.log('hello')
        }
    }
}]);