module.exports = {
    name: 'index',
    template: require('./index.html'),
    controller: ['$config', '$location', '$window', 'Project', function ($config, $location, $window, Project) {
        require('./index.scss');
        let self = this;
        this.$routerOnActivate = (next) => {
            Project.get().then((res) => {
                self._project = res.data;
            }).catch((err) => {
                setTimeout(function() {
                    document.querySelector('#btnApply').click();    
                });
            });
        }

        this.save = () => {
            if(!self._project.plugins.oauthv2.session_expired) {
                self.err = true;
            }else {
                self.err = false;
            }

            Project.update(self._project).then((res) => {
                // success
            }).catch((err) => {
                console.log(err);
            });
        };

        this.sendRedirect = () => {
            $location.path('/');
        }
    }]
}