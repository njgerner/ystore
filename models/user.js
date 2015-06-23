module.exports = {
	newUser: function(email, password) {
		var bcrypt = require('bcryptjs'),
    		crypto = require('crypto'),
    		hash = bcrypt.hashSync(password, 8),
    		token = crypto.randomBytes(48).toString('hex'),
    		id = crypto.randomBytes(20).toString('hex');
    		
		return {
			"id": id,
			"email": email,
			"hash": hash,
			"tempPwd" : false,
			"token": token,
			"isAdmin": false,
			"jsonType": "user",
			"createdAt": new Date(),
			"updatedAt": new Date()
		};
	},

	//validation functions
	validPassword: function(password) {
		return password.length >= 6;
	},

	validEmail: function(email) {
		// body...
	},

	validRegKey: function(regkey) {
		return regkey.length >= 6;
	}
};