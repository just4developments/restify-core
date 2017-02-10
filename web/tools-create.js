const path = require('path');
const fs = require('fs');



var comName = process.argv[3];
var folName = process.argv[2]

if(!comName || !folName){
    throw 'You must input folderName and component-name';
}

let handleComName = (name) => {
    var n = name.split('-');
    for(var i in n){
        if(i != 0) n[i] = n[i][0].toUpperCase() + n[i].substr(1);
    }
    return n.join('');
}
let pathComponent = path.join(__dirname, 'public', 'components');
let pathFile = path.join(pathComponent, folName);
if (!fs.existsSync(pathFile)){
    fs.mkdirSync(pathFile);
}
let htmlFile = path.join(pathFile, comName+'.html');
try{
    fs.lstatSync(htmlFile)
    console.error(`File ${htmlFile} was existed!`);
}catch(e){
    fs.writeFileSync(htmlFile, '');
}

let jsFile = path.join(pathFile, comName+'.js');
try{
    fs.lstatSync(jsFile)
    console.error(`File ${jsFile} was existed!`);
}catch(e){
    fs.writeFileSync(jsFile, 
`module.exports = {
    name: '${handleComName(comName)}',
    template: require('./${comName}.html'),
    controller: ['$config', function ($config) {
        require('./${comName}.scss');
        this.$routerOnActivate = (next) => {
            
        }
        
    }]
}
`);
}

let cssFile = path.join(pathFile, comName+'.scss');
try{
    fs.lstatSync(cssFile)
    console.error(`File ${cssFile} was existed!`);
}catch(e){
    fs.writeFileSync(cssFile, 
`${comName} {

}
`);
}


require('./webpack.import');