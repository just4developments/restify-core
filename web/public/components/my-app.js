require('./my-app.css');
module.exports = {
    name: 'myApp',
    template: require('./my-app.html'),
    $routeConfig: [
        { path: '/',name: 'Login',component: 'login',useAsDefault: true},
        { path: '/projects',name: 'Projects',component: 'projects'},
        { path: '/index',name: 'Index',component: 'index'},
        { path: '/role',name: 'Role',component: 'role'},
        { path: '/empty',name: 'Empty',component: 'empty' },
        { path: '/account',name: 'Account',component: 'account'}
    ]
}