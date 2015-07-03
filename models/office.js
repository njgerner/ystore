module.exports = {
	newOffice: function(addressDoc) {

		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');

		return {
			"id": id,
			"name": addressDoc.name,
			"address1": addressDoc.address1,
			"address2": addressDoc.address2,
			"city" : addressDoc.city,
			"state": addressDoc.state,
			"zip": addressDoc.zip,
			"country": addressDoc.country,
			"default": addressDoc.default,
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	}
};