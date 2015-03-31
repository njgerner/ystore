module.exports = {
	newProfile: function(email, name, office) {
		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex'),
			offices = [];
		console.log('pushing office', office);
		if (office !== undefined) {
    		offices.push(office);
		}

		return {
			"id": id,
			"email": email,
			"name": name,
			"offices": offices,
			"cart": null,
			"jsonType": "profile",
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	},


	addOffice: function(profile, office) {
		profile.offices.push(office);
	}

};