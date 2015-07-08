appDirectives.directive('nameDir', ['profileService', 
	function(profileService) {
	return {
			restrict: 'E',
			scope: {
				id: '=',
				format: '@'
			},
			templateUrl: 'directives/name_template.html',
			link: function(scope, element) {
				scope.name = "";
				if (!scope.width || !scope.height) {
					scope.width = scope.height = 20; // should be symmetric 
				}

				scope.$watch('id', function(newValue, oldValue) {
					if (newValue) {
						profileService.getProfileByID(scope.id, function(error, data) {
							if (scope.format == 'initials') {
								var name = data.name.split(' ', 3);
								for (var i = 0; i < name.length; i++) {
									scope.name += name[i].charAt(0);
								}
							} else if (scope.format == "first-name") {
								scope.name = data.name.split(' ')[0];
							}else {
								scope.name = data.name || data.email;
							}
						});
					}
				});
			}
		};
	}]);
