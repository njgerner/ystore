exports.push_values_to_top = function(docs) {
	var nestedValues = [];
	for (var i = 0; i < docs.length; i++) {
		nestedValues.push(docs[i].value);
	}
	return nestedValues;
};

exports.addMetaToProfile = function(profile, metadata) {
	var address = {
      address1: metadata.address1,
      address2: metadata.address2,
      city: metadata.city,
      state: metadata.state,
      zip: metadata.zip,
      country: metadata.country
    };
    profile.addresses.push(address);
    if (metadata.staff) {
      profile.staff = JSON.parse(metadata.staff);
    }
};