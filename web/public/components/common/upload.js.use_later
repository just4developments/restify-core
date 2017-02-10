module.exports = {
  name: 'uploadLogo',
  template: require('./upload.html'),
  bindings: {
    theme: '@',
    defaultSrc: '@',
    itemSrc: '=',
    url: '<',
    file: '@',
    fields: '<',
    done: '&',
    error: '&', 
    pattern: '@',
    size: '<'
  },
  controller: ['Upload', '$window', '$rootScope', '$config', function(Upload, $window, $rootScope, $config) {    
    var self = this;
    var height = 170;   
    var body = this.fields || {};
    if(this.size){
        var i = this.itemSrc.lastIndexOf('/');
        this.itemSrc = this.itemSrc.substr(0, i+1) + this.size + this.itemSrc.substr(i);
    }
    this.apiUrl = (this.itemSrc && this.itemSrc.indexOf('http')!==0) ? $config.apiUrl : '';
    this.pattern = this.pattern || 'image/*';  
    this.upload = function (file) {
      if(file === null) return null;
      body[this.file] = file;
      self.percent = 0;
      self.itemSrc = undefined;
      this.percentCss = {'top': 100+'%'};
      Upload.upload({
          url: this.url,
          headers: {
            'access_token': $rootScope.user.access_token
          },
          data: body
      }).then(function (resp) {            
          delete self.percent;
          self.itemSrc = resp.data[0];
          self.percent = 100;
          self.done({resp: resp});
      }, function (resp) {
          delete self.percent;
          self.error({resp: resp});
      }, function (evt) {
          self.percent = parseInt(100 * evt.loaded / evt.total);
          self.percentCss = {'top': (100 - self.percent) + '%'};
      });
    };
  }]
}