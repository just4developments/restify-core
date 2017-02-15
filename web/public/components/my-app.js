require('./my-app.css');
module.exports = {
    name: 'myApp',
    template: require('./my-app.html'),
    $routeConfig: [
        { path: '/',name: 'Index',component: 'index',useAsDefault: true},
        { path: '/role',name: 'Role',component: 'role'},
        { path: '/empty',name: 'Empty',component: 'empty' },
        { path: '/account',name: 'Account',component: 'account'}
    ]
}