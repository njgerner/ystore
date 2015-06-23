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
	},

	addAddress: function(profile, data) {
		var address = {};
		if (data.address1 && data.city && data.state && data.zip) {
			address.address1 = data.address1;
			address.city = data.city;
			address.state = data.state;
			address.zip = data.zip;
			address.country = data.county;
		}
		profile.addresses.push(address);
	}
};