module.exports = {
	newProfile: function(owner, category) {
			var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');
		return {
			"id": id,
			"name": null,
			"owner": owner,
			"category": category,
			"addresses": [],
			"jsonType": "merchant",
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	}
};