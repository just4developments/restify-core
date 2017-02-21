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
              
            if(!$location.search().id) {
                console.log("Lack of PJID");
                return;
            }
            if(!self.user.username) {
                self.err.usr = "*";
                return;
            }
            if(!self.user.password){
                self.err.pwd = "*";
                return;
            } 

            let projectId;
            //Root PJID : 58a6db5263e9bd2b3c584066
            // Validium PJID : 58abe92aee82392c800270c9
            if(!$window.sessionStorage.projectId) projectId = $location.search().id;
            Account.login(self.user, projectId).then((res) => {
                $window.localStorage.token = res.headers('token');
                $http.defaults.headers.common.token = res.headers('token');
                $location.path('/projects');
            });
            
        }
    }]
}
