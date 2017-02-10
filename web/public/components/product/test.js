module.exports = {
    name: 'test',
    template: require('./test.html'),
    controller: ['$config', function ($config) {
        require('./test.scss');
        this.$routerOnActivate = (next) => {
            
        }
        
    }]
}
