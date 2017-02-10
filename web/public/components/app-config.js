module.exports = ['$locationProvider', '$config', '$httpProvider', function ($locationProvider, $config, $httpProvider) {
    $locationProvider.html5Mode(false);
}]