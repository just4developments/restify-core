let fs = require('fs');

module.exports = {
    export: (input, obj, output) => {
        try {
            fs.statSync(output);
            console.warn(`#WARN\t${output} is existed`);
        } catch (e) {
            let cnt = new String(fs.readFileSync(input));
            for(let k in obj){
                cnt = cnt.replace(new RegExp(`\\$\\{${k}\\}`, 'g'), obj[k]);
            }    
            fs.writeFileSync(output, cnt);
        }
    }
}