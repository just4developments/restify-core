module.exports = {
    name: 'projects',
    template: require('./projects.html'),
    controller: ['$config', 'Project', function ($config, Project) {
        require('./projects.scss');

        let self = this;
        self._project = {};
        self.err = {};
        this.$routerOnActivate = (next) => {
            Project.get().then((res)=> {
                self._projects = res.data;
            }).catch((err) => {
                setTimeout(function() {
                    document.querySelector('#btnApply').click();    
                });
            });
        }
        this.create = () => {
            !self._project.name ? self.err.name = "*" : self.err.name = "";
            !self._project.email ? self.err.email = "*" : self.err.email = "";
            self._project.status == undefined ? self.err.stt = "*" : self.err.stt = "";

            if(self.err.name == "*"  || self.err.email == "*" || self.err.stt == "*") return;

            Project.add(self._project).then((res) => {
                if(!self._projects) {
                    self._projects = [];
                }
                self._projects.splice(0, 0, res.data);
                this.closeModal();
            });
        };
        this.save = () => {
            !self._project.name ? self.err.name = "*" : self.err.name = "";
            !self._project.email ? self.err.email = "*" : self.err.email = "";
            self._project.status == undefined ? self.err.stt = "*" : self.err.stt = "";

            if(self.err.name == "*"  || self.err.email == "*" || self.err.stt == "*") return;

            Project.update(self._project).then((res) => {
                console.log(res);
                this.closeModal();
            });
        };
        this.delete = () => {
            if(!self._project) this.closeModal();
            let index = self._projects.indexOf(self._project);
            
            if(self._projects[index] && self._projects[index]._id === self._project._id) {
                Project.delete(self._project._id).then((res) => {
                    console.log(res);
                    self._projects.splice(index,1);
                    this.closeModal();
                });
            }
        }
        this.showModal = (type, item) => {
            if(type==='add') self._isCreate = 1;
            else if(type==='delete') self._isDelete = 1;
            else if(type==='edit') self._oldItem = _.cloneDeep (item);

            self._project = (!item ? {}:item);
            document.getElementById('favDialog').showModal();
        };
        this.sendRedirect = () => {
            $location.path('/empty');
        };
        this.closeModal = () => {
            self._isDelete = "";
            self._isCreate = "";
            self._project = {};
            document.getElementById('favDialog').close();
        }
    }]
}
