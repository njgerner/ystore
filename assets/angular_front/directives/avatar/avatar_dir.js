// appDirectives.directive('avatarDir', ['$rootScope', 'authService', function($rootScope, authService) {
// 	return {
// 			restrict: 'E',
// 			scope: {
// 			},
// 			templateUrl: 'directives/avatar_template.html',
// 			// replace: true, // Replace with the template below
// 			// transclude: true, // we want to insert custom content inside the directive
// 			link: function(scope, element) {

// 				scope.name = null;
// 				scope.url = null;

// 				scope.handleLoaded = function() {
//     			if (authService.authorized) {
//     				scope.name = authService.profile.name;
//     				scope.url = authService.userid + '.jpg';
//     				console.log('scope url', scope.url);
//     			} else {
//     				scope.name =  null;
//     				scope.userid = null;
//     			}
//     		}

// 				if (authService.authorized) {
// 					scope.name = authService.profile.name;
//     			scope.url = authService.userid + '.jpg';
// 				} else {
// 					scope.loadedFun = null;
// 			    scope.loadedFun = $rootScope.$on('authorizationloaded', function(evt, args) {
// 		        scope.handleLoaded();
// 		        scope.loadedFun();
//     			});
// 				}
// 			}
// 		};
// 	}]);