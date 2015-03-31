appDirectives.directive('comingSoonDir', ['$parse', function ($parse) {
    return {
        restrict: 'E',
        templateUrl: 'directives/coming_soon_template.html',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
        }
    };
}]);