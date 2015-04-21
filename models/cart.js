module.exports = {
	newCart: function() {
		console.log('making new cart');

		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');

    	console.log('cart id', id);

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