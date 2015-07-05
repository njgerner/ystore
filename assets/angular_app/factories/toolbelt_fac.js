trdFactories.factory("toolbelt", ['$rootScope',
    function ($rootScope) {

    	var toolbelt = {};

    	toolbelt.displayLocalTime = function (date) {
    		return moment(date).format('LT');
    	}

    	return toolbelt;

}]);