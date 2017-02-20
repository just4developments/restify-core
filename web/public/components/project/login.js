module.exports = {
    name: 'login',
    template: require('./login.html'),
    controller: ['$config', 'Account', '$http', '$location', '$window', function ($config, Account, $http, $location, $window) {
        require('./login.scss');
        let self = this;
        self.user = {};

        this.$routerOnActivate = (next) => {
            
        }
        
        this.login = () => {
            self.err= {};
            if(!self.user.username) self.err.usr = "*";
            if(!self.user.password) self.err.pwd = "*";
            let projectId;
            if(!$window.sessionStorage.projectId) projectId = '58997ac77e9a4435508973bf';
            Account.login(self.user, projectId).then((res) => {
                $window.localStorage.token = res.headers('token');
                $http.defaults.headers.common.token = res.headers('token');
                $location.path('/projects');
            });
            
        }
    }]
}
