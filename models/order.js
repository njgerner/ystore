module.exports = {
	newOrder: function(total, customer) {
		var bcrypt = require('bcryptjs'),
    		crypto = require('crypto'),
    		id = crypto.randomBytes(20).toString('hex');

		return {
			"id": id,
			"charge": "check",
			"total": total,
			"customer": customer,
			"created_at": new Date(),
			"updated_at": new Date(),
			"status": "PENDING"
		};
	}
};