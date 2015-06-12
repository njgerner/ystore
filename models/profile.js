module.exports = {
	newProfile: function(email) {
		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');
		return {
			"id": id,
			"email": email,
			"name": null,
			"addresses": [],
			"cart": null,
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	}
};