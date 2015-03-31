appDirectives.directive('fileModelDir', ['$parse', function ($parse) {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
    	console.log('attrs', attrs);
      var model = $parse(attrs.fileModelDir);
      console.log('parse result', model);
      var modelSetter = model.assign;
      
      element.bind('change', function(){
        scope.$apply(function(){
          modelSetter(scope, element[0].files[0]);
        });
      });
    }
  };
}]);