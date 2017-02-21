module.exports = {
    name: 'account',
    template: require('./account.html'),
    controller: ['$config', 'Role', 'Account', '$location', function ($config, Role, Account, $location) {
        require('./account.scss');

        let self = this;
        self._account = {};
        self.err = {};
        this.$routerOnActivate = (next) => {
            Role.get().then((res) => {
                if(res.data.constructor === Array) self._roles = res.data;
            }).catch((err) => {
                setTimeout(function() {
                    document.querySelector('#btnApply').click();    
                });
            }); 

            Account.get().then((res) => {
                self._accounts = res.data;
            })
        }

        this.getID2LabelRole = (arr) => {
            if (!arr || !self._roles) return;

            let role = "";
            for(var i = 0 ; i < arr.length ; i++){
                for(var y = 0 ; y < self._roles.length ; y++){
                    if(arr[i] == self._roles[y]._id){
                        role += self._roles[y].name + ", ";
                        break;
                    }
                }
            }
            return role;
        }

        this.create = () => {
            !self._account.username ? self.err.usr = "*" : self.err.usr = "";
            !self._account.password ? self.err.pwd = "*" : self.err.pwd = "";
            self._account.password !== self._account.repwd ? self.err.repwd = "*" : self.err.repwd = "";
            self._account.status == undefined ? self.err.stt = "*" : self.err.stt = "";
            !self._account.role_ids ? self.err.role = "*" : self.err.role = "";

            if(self.err.usr == "*"  || self.err.pwd == "*" || self.err.repwd == "*"|| self.err.stt == "*"|| self.err.role== "*") return;

            delete self._account.repwd;
            self._account.recover_by = self._account.username; 
            
            Account.add(self._account).then((res) => {
                if(!self._accounts) {
                    self._accounts = [];
                }
                self._accounts.splice(0, 0, res.data);
                this.closeModal();
            });
        };
        this.save = () => {
            !self._account.username ? self.err.usr = "*" : self.err.usr = "";
            if(self._oldItem.password !== self._account.password) {
                !self._account.password ? self.err.pwd = "*" : self.err.pwd = "";
                self._account.password !== self._account.repwd ? self.err.repwd = "*" : self.err.repwd = "";
            }
            self._account.status == undefined ? self.err.stt = "*" : self.err.stt = "";
            !self._account.role_ids ? self.err.role = "*" : self.err.role = "";

            if(self.err.usr == "*"  || self.err.pwd == "*" || self.err.repwd == "*"|| self.err.stt == "*"|| self.err.role== "*") return;

            delete self._account.repwd;

            Account.update(self._account).then((res) => {
                this.closeModal();
            });
        };
        this.delete = () => {
            if(!self._account) this.closeModal();
            let index = self._accounts.indexOf(self._account);
            
            if(self._accounts[index] && self._accounts[index]._id === self._account._id) {
                Account.delete(self._account._id).then((res) => {
                    self._accounts.splice(index,1);
                    this.closeModal();
                });
            }
        }
        this.showModal = (type, item) => {
            if(type==='add') self._isCreate = 1;
            else if(type==='delete') self._isDelete = 1;
            else if(type==='edit') self._oldItem = _.cloneDeep (item);

            self._account = (!item ? {}:item);
            document.getElementById('favDialog').showModal();
        } 
        this.sendRedirect = () => {
            $location.path('/');
        }
        this.closeModal = () => {

            if(self._oldItem && self._oldItem.password !== self._account.password) {
                self._account.password = self._oldItem.password;
                self._account.repwd = ""; 
            }
            self._isDelete = "";
            self._isCreate = "";
            self._account = {};
            document.getElementById('favDialog').close();
        }
    }]
}
