angular.module('FirstCapitalFilter', []).filter('capital', function() {
  return function(value) {
    // Relace first letter
    const output = value.charAt(0).toUpperCase() + value.slice(1);
    return output;
  }
});