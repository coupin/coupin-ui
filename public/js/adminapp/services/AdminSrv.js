angular.module('AdminSrv', []).factory('AdminService', [
    '$http',
    'config',
    'StorageService',
function(
    $http,
    config,
    StorageService
){
    var baseV1Url = config.baseUrl;
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
        getMerchNames : function() {
            return $http.get(`${baseV1Url}/merchant/names`, {
                headers: authHeader
            });
        },
        deleteSlide: function(data) {
            return $http.put(`${baseV1Url}/admin/hotlist`, data, {
                headers: authHeader
            });
        },
        retrieveHotList: function() {
            return $http.get(`${baseV1Url}/admin/hotlist`, {}, {
                headers: authHeader
            });
        },
        setHotList: function(data) {
            return $http.post(`${baseV1Url}/admin/hotlist`, data, {
                headers: authHeader
            });
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