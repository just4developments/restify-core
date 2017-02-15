module.exports = {    
    Cuisine: ['$http', '$rootScope', '$config', '$q', function ($http, $rootScope, $config, $q) {
        return {
            findById: (id) => {
                var cuisine = null;
                $rootScope.cuisines.forEach(item => {
                    if (item.id == id)
                        cuisine = item;
                });
                return cuisine;
            },
            search: (name) => {
                var deferred = $q.defer();
                var rs = [];
                name = name.toLowerCase();
                for (var item of $rootScope.cuisines) {
                    if (item.name.toLowerCase().indexOf(name) != -1 || item.des.toLowerCase().indexOf(name) != -1)
                        rs.push(item);
                }
                setTimeout(() => {
                    deferred.resolve({
                        data: rs
                    });
                }, 500);
                return deferred.promise;
            },
            find: () => {
                // Used in new version
                return $http.get(`${$config.apiUrl}/whatseat/cuisine`);
            },
            load: () => {
                $http.get(`${$config.apiUrl}/whatseat/cuisine`).then((res) => {
                    $rootScope.cuisines = res.data;
                });
            }
        };
    }],
    Project: ['$http', '$rootScope', '$config', '$q', '$location', function($http, $rootScope, $config, $q,$location) {
        return {
            get: () => {
                return $http.get(`${$config.apiUrl}/project`).then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    $location.path('/empty');
                });
            },
            add: (data) => {
                return $http.post(`${$config.apiUrl}/project`, data).then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    $location.path('/empty');
                });
            },
            update: (data) => {
                return $http.put(`${$config.apiUrl}/project`, data).then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    $location.path('/empty');
                });
            },
            getDetail(id) {
                return $http.get(`${$config.apiUrl}/project/${id}`).then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    $location.path('/empty');
                });
            },
            delete(id) {
                return $http.delete(`${$config.apiUrl}/project/${id}`).then(function successCallback(response) {
                    return response;
                }, function errorCallback(response) {
                    $location.path('/empty');
                });
            }
        };
    }],
    Role: ['$http', '$rootScope', '$config', '$q', function($http, $rootScope, $config, $q) {
        return {
            get: () => {
                return $http.get(`${$config.apiUrl}/role`);
            },
            add: (data) => {
                return $http.post(`${$config.apiUrl}/role`, data);
            },
            update: (data) => {
                return $http.put(`${$config.apiUrl}/role/${data._id}`, data);
            },
            getDetail(id) {
                return $http.get(`${$config.apiUrl}/role/${id}`);
            },
            delete(id) {
                return $http.delete(`${$config.apiUrl}/role/${id}`);
            }
        };
    }]
}