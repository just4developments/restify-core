require('../public/index.htm');

require([]);

require(['angular', 'router',
		'../public/assets/js/0.lodash.js'], (angular) => {
    global.app = angular.module('myApp', ['ngComponentRouter']).value('$routerRootComponent', 'myApp');
    require(['../public/components/app-const.js',
			'../public/components/app-config.js',
			'../public/components/app-run.js',
			'../public/components/app-directive.js',
			'../public/components/app-filter.js',
			'../public/components/app-provider.js',
			'../public/components/my-app.js',
			'../public/components/error/empty.js',
			'../public/components/product/product-list.js',
			'../public/components/product/test.js',
			'../public/components/project/index.js',
			'../public/components/project/role.js'], (...com) => {
        for (var i in com) {
            if (i == 0) global.app.constant('$config', com[i]);
            else if (i == 1) global.app.config(com[i]);
            else if (i == 2) global.app.run(com[i]);            
            else if (i == 3) for (var key in com[i]) global.app.directive(key, com[i][key]);
            else if (i == 4) for (var key in com[i]) global.app.filter(key, com[i][key]);
            else if (i == 5) for (var key in com[i]) global.app.factory(key, com[i][key]);
            else global.app.component(com[i].name, com[i]);
        }
    });
})