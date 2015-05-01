exports.push_values_to_top = function(docs) {
	var nestedValues = [];
	for (var i = 0; i < docs.length; i++) {
		nestedValues.push(docs[i].value);
	}
	return nestedValues;
};