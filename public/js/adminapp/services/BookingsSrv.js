angular.module('BookingsSrv', []).factory('BookingsService', [
  '$http',
  'ENV_VARS',
  'StorageService'
, function(
  $http,
  ENV_VARS,
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
    getBookings: function(filters) {
      const keys = Object.keys(filters);
      let isFirst = true;
      let url = `${baseV1Url}/coupin/search`;

      keys.forEach((key) => {
        if (filters[key]) {
          url += isFirst ? `?${key}=${filters[key]}` : `&${key}=${filters[key]}`;
          isFirst = false;
        }
      });

      return $http.get(url, {
          headers: getAuthHeader()
      });
    }
  };
}]);