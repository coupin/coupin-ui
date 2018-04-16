angular.module('AdminSrv', []).factory('AdminSrv', [
    '$http',
    'StorageService',
function(
    $http,
    StorageService
){
    var baseV1Url = 'http://localhost:5030/api/v1';
    var token = StorageService.getToken();
    var authHeader = {
        'x-access-token': token
    };

    return {
        // call to POST new admin
        create: function(adminData) {
            return $http.post(`${baseV1Url}/admin`, adminData, {
                headers: authHeader
            });
        },
        // Call to GET admins
        get : function() {
            return $http.get(`${baseV1Url}/admin`, {
                headers: authHeader
            });
        },
        getAdmin : function(id) {
            return $http.delete('/admin/' + id);
        },
        // Call to DE-Activate admin
        toggleStatus: function(id) {
            return $http.put(`${baseV1Url}/admin/${id}`, {}, {
                headers: authHeader
            });
        },
        // call to DELETE an admin
        delete: function(id) {
            return $http.delete(`${baseV1Url}/admin/` + id, {
                headers: authHeader
            });
        }
    }
}]);