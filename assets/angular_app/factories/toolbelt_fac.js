trdFactories.factory("toolbelt", ['$rootScope',
    function ($rootScope) {

    	var toolbelt = {};

    	toolbelt.displayLocalTime = function (date) {
    		return moment(date).format('LT');
    	}

    	toolbelt.insertCommasIntoNumber = function (number) {
    		return number.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( "," );
    	}

    	return toolbelt;

}]);