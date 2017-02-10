require('./my-app.css');
module.exports = {
    name: 'myApp',
    template: require('./my-app.html'),
    $routeConfig: [{
        path: '/product-list',
        name: 'ProductList',
        component: 'test',
        useAsDefault: true
    }]
}