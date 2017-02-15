require('./my-app.css');
module.exports = {
    name: 'myApp',
    template: require('./my-app.html'),
    $routeConfig: [{
        path: '/',
        name: 'Index',
        component: 'index',
        useAsDefault: true
    },
    {
        path: '/role',
        name: 'Role',
        component: 'role'
    },
    {
        path: '/empty',
        name: 'Rmpty',
        component: 'empty'
    }]
}