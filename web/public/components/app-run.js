module.exports = ['$rootScope', '$location', '$http', '$window', function ($rootScope, $location, $http, $window) {
    if($window.localStorage.token) $http.defaults.headers.common.token = $window.localStorage.token;
}];