module.exports = {
    name: 'empty',
    template: require('./empty.html'),
    controller: ['$config', function ($config) {
        require('./empty.scss');
        this.$routerOnActivate = (next) => {
            
        }
        
    }]
}
