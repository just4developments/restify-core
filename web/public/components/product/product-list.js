module.exports = {
    name: 'productList',
    template: require('./product-list.html'),
    bindings: {
        data: '<'
    },
    controller: ['$config', function ($config) {
        require('./product-list.css');
    }]
}