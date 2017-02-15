module.exports = ['$rootScope', '$location', '$http', function ($rootScope, $location, $http) {
    //ADMIN :  $http.defaults.headers.common.secret_key = '589c3d982f2ff310ccf17dcb';
    //USER : 
    $http.defaults.headers.common.secret_key = '589d95c4c392f347c4d3c9f9';
}];