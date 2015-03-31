module.exports = {
	newCustomer: function(userid, cartid, stripeToken) {

		return {
			"userid": userid,
			"cartid": cartid,
			"stripeToken": stripeToken
		};
	}
};