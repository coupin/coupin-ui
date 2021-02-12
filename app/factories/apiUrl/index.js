export function apiUrl($window) {
  'ngInject';

  return (
    path => {
      return `${$window.API_URL}`.concat(path);
    }
  );
}

export default app => app.factory('apiUrl', apiUrl);
