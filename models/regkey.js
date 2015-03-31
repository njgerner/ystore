module.exports = {
	newRegKey: function(regkey) {
		return {
			"regkey": regkey,
			"user": null,
			"activationDate": null,
			"isActive": false
		};
	},
	
	//validation methods
	validRegKey: function(regkey) {
		return regkey.length >= 6;
	}
};