angular.module('CustomerSrv', []).factory('CustomerService', [
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
        getAll: function (page) {
            // search param?
            return $http.get(`${baseV1Url}/customers?page=${page}`, {
                headers: getAuthHeader()
            }) 
        }
    }
}]);