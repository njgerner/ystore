trdFactories.factory("toolbelt", ['$rootScope',
    function ($rootScope) {

    	var toolbelt = {};

    	toolbelt.displayLocalTime = function (date) {
    		if (!date) {
    			return "";
    		} else {
    			return moment(date).format('LT');
    		}
    	}

    	toolbelt.displayDate = function (date, format, options) {
    		if (!date) {
    			return "";
    		} else {
    			if (options.type) {
    				return moment(date, options.type).format(format);
    			} else {
    				return moment(date).format(format);
    			}
    		}
    	}

    	toolbelt.displayAddress = function (address) {
    		if (!address) {
		        return "No address information provided";
		      } else {
		        return  "<strong>" + address.name + "</strong>" + "<br>" + 
		                address.address1 + " " + (address.address2 || "") + "<br>" + 
		                address.city + ", " + address.state + " " + address.zip;
		      }
    	}

    	return toolbelt;

}]);