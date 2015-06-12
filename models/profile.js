module.exports = {
	newProfile: function(email, metadata) {
		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');
    	if(metadata == "individual") {	//individual reg
    		return {
				"id": id,
				"email": email,
				"name": null,
				"addresses": [],
				"cart": null,
				"createdAt": new Date(),
				"updatedAt": new Date()
			};
    	}	//ylift reg
    	var address = {"address1": metadata.address1};
    	if(metadata.address2) {
    		address.address2 = metadeta.address2;
    	}
    	address.city = metadata.city;
    	address.state = metadata.state;
    	address.zip = metadata.zip;
    	address.country = metadata.country;
    	if(metadata.staff) {
    		metadata.staff = JSON.parse(metadata.staff);
    	}
		return {
			"id": id,
			"email": email,
			"name": null,
			"addresses": [address],
			"cart": null,
			"createdAt": new Date(),
			"updatedAt": new Date(),
			"metadata": metadata
		};
	}
};