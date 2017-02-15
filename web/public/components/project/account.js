module.exports = {
    name: 'account',
    template: require('./account.html'),
    controller: ['$config', function ($config) {
        require('./account.scss');
        this.$routerOnActivate = (next) => {
            
        }
        
    }]
}
