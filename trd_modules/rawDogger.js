exports.push_values_to_top = function(docs) {
	var nestedValues = [];
	for (var i = 0; i < docs.length; i++) {
		nestedValues.push(docs[i].value);
	}
	return nestedValues;
};

exports.extract_docs_with_prop_value = function(docs, prop, val, options) {
  var result = [];
  var singleProperty = options.singleProperty || false;
  if (Array.isArray(docs)) {
    docs.forEach(function (doc, index) {
      if (doc[prop] == val) {
        if (singleProperty) {
          result.push(doc[options.property]);
        } else {
          result.push(doc);
        }
      }
    });
    return result;
  } else {
    throw new Error('rawDogger method: \'extract_docs_with_prop_value\' extracts docs from arrays only.');
  }
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