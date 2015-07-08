module.exports = {
	newCart: function() {

		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');

		return {
			"id": id,
			"products": [

				],
			"status": "virgin",
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	}
};