const fs = require('fs');
const path = require('path');

const LOADED_PATTERN = /^\d+\./;

let loadCss = (pathCss, insertPath) => {
  var files = [];
  for(var f of fs.readdirSync(pathCss)){
    files.push(`'${insertPath + '/' + f}'`);
  }
  files.sort();
  return files;
};

let loadJs = (pathJs, insertPath) => {
  var libs = ['angular', 'router'].map(e=>{ return `'${e}'`}).join(', ');
  var files = [];
  for(var f of fs.readdirSync(pathJs)){
    files.push(`'${insertPath + '/' + f}'`);
  }
  files.sort();
  files.splice(0, 0, libs);
  return files;
};

let loadComponents = (pathComponents, insertPath) => {
  let componentJs = [['app-const.js', 'app-config.js', 'app-run.js', 'app-directive.js', 'app-filter.js', 'app-provider.js', 'my-app.js'].map(e=>{
    return "'" + insertPath + '/' + e + "'";
  })];  
  let loadComponent = (pathComponents, level, insertPath) => {
    if(!componentJs[level]) componentJs[level] = [];
    for(let f of fs.readdirSync(pathComponents)){
      let path0 = path.join(pathComponents, f);
      let stat = fs.lstatSync(path0);
      if(stat.isDirectory()){
        loadComponent(path0, level+1, insertPath+'/'+f);
      }else if(level > 0 && /\.js$/.test(f)){
        componentJs[level].push(`'${insertPath+'/'+f}'`);
      }
    }
  }
  loadComponent(pathComponents, 0, insertPath);
  var all = [];
  for(var i in componentJs){
    if(i != 0) componentJs[i].sort();
    all = all.concat(componentJs[i]);
  }
  return all;
};

let content = ["require('../public/index.htm');"];

let css = loadCss(path.join(__dirname, 'public', 'assets', 'css'), '../public/assets/css');
console.log(css);
content.push(`require([${css.join(',\n\t\t')}]);`);

let js = loadJs(path.join(__dirname, 'public', 'assets', 'js'), '../public/assets/js');
let com = loadComponents(path.join(__dirname, 'public', 'components'), '../public/components');

content.push(`require([${js.join(',\n\t\t')}], (angular) => {
    global.app = angular.module('myApp', ['ngComponentRouter']).value('$routerRootComponent', 'myApp');
    require([${com.join(',\n\t\t\t')}], (...com) => {
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
})`);

fs.writeFileSync(path.join(__dirname, 'webpack', 'app.js'), content.join('\n\n'));
console.log("Added route into config file!"); 