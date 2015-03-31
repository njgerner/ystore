module.exports = {
	newCart: function(userid) {
		console.log('making new cart');

		var crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');

    	console.log('cart id', id);
    	console.log('user id', userid);

		return {
			"id": id,
			"user": userid,
			"products": [

				],
			"status": "virgin",
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	}
};