module.exports = {
    name: 'role',
    template: require('./role.html'),
    controller: ['$config', 'Role', '$location', function ($config, Role, $location) {
        require('./role.scss');
        let self = this;
        self._api = [];
        self._web = [];
        self._mob = [];
        self._rname = "";

        this.$routerOnActivate = (next) => {
            Role.get().then((res) => {
                self._roles = res.data;
                
                if(self._roles) return;
                
                for (var i = 0; i < self._roles.length; i++){
                    self._roles[i].api = this.arrInOneLine(self._roles[i].api);
                    self._roles[i].web = this.arrInOneLine(self._roles[i].web);
                    self._roles[i].mob = this.arrInOneLine(self._roles[i].mob);
                }      
            }).catch((err) => {
                setTimeout(function() {
                    document.querySelector('#btnApply').click();    
                });
            }); 
        }
        
        this.addRole = () => {
            if(!self._rname) 
                alert ('Please enter Role name');
            Role.add({name:self._rname}).then((res) => {
                if(!self._roles) self._roles = [];
                self._roles.push(res.data);
                self._rname = "";
            });
        }
        this.deleteRole = (_index, _id) => {
            if(confirm("Do you want to delete this role")) {
                Role.delete(_id).then((res) => {
                    self._roles.splice(_index, 1);
                });
            }
        }
        this.addConfigRow = (_index,type) => {
            if(type=='api') {
                if (!self._api[_index].path || !self._api[_index].actions) return;
                self._api[_index].actions = self._api[_index].actions.toUpperCase();

                if(self._roles[_index].api){
                    self._roles[_index].api.splice(0, 0, self._api[_index]);
                }else {
                    self._roles[_index].api = [];
                    self._roles[_index].api.push(self._api[_index]);
                }
                self._api[_index] = {};
            } else if(type=='web') {
                if (!self._web[_index].path || !self._web[_index].actions) return;
                self._web[_index].actions = self._web[_index].actions.toUpperCase();
                
                if(self._roles[_index].web){
                    self._roles[_index].web.splice(0, 0, self._web[_index]);
                }else {
                    self._roles[_index].web = [];
                    self._roles[_index].web.push(self._web[_index]);
                }
                self._web[_index] = {};
            } else if(type=='mob') {
                if (!self._mob[_index].path || !self._mob[_index].actions) return;
                self._mob[_index].actions = self._mob[_index].actions.toUpperCase();

                if(self._roles[_index].mob){
                    self._roles[_index].mob.splice(0, 0, self._mob[_index]);
                }else {
                    self._roles[_index].mob = [];
                    self._roles[_index].mob.push(self._mob[_index]);
                }
                self._mob[_index] = {};
            }
            
        }

        this.save = (_index, type) => {
            // validate object
            let _temp;
            if (type == 'api'){
                let _lstAPIs = self._roles[_index].api;
                self._roles[_index].api = this.removeElement(_lstAPIs);
                _temp = _.cloneDeep(self._roles[_index]);
                _temp.api = this.convert2Arr(_temp.api);

                delete _temp.web;
                delete _temp.mob;
            }else if (type == 'web'){
                let _lstAPIs = self._roles[_index].web;
                self._roles[_index].web = this.removeElement(_lstAPIs);
                _temp = _.cloneDeep(self._roles[_index]);
                _temp.web = this.convert2Arr(_temp.web);

                delete _temp.mob;
                delete _temp.api;
            }else if (type == 'mob'){
                let _lstAPIs = self._roles[_index].mob;
                self._roles[_index].mob = this.removeElement(_lstAPIs);
                _temp = _.cloneDeep(self._roles[_index]);
                _temp.mob = this.convert2Arr(_temp.mob);
                delete _temp.web;
                delete _temp.api;
            }
            
            Role.update(_temp).then((res) => {
                alert("Data is saved !")
            });
        }

        this.convert2Arr = (arr) => {
            if(!arr) return arr;
            for(var i = 0; i < arr.length; i++){
                if(arr[i].actions!="") {
                    arr[i].actions = arr[i].actions.split(",");
                }
            }
            return arr;
        }
        this.removeElement = (arr) => {
            if(!arr) return arr;
            for(var i = 0; i < arr.length; i++){
                if(arr[i].path=="" || arr[i].actions=="") {
                    arr.splice(i,1);
                    this.removeElement(arr);
                }
            }
            return arr;
        };

        this.sendRedirect = () => {
            $location.path('/empty');
        }

        this.arrInOneLine = (_obj) => {
            if(!_obj || _obj.length == 0) 
                return;
            let append_str = "";
            for (var i = 0; i < _obj.length; i++) {
                if(_obj[i].actions && _obj[i].actions.length>0) {
                    append_str = ""
                    for (var x =0 ; x< _obj[i].actions.length; x ++) {
                        append_str += _obj[i].actions[x] + ",";
                    }
                    append_str = append_str.substr(0, append_str.length-1);
                    _obj[i].actions = append_str;
                }
            }
            return _obj;
        }
        
    }]
}
