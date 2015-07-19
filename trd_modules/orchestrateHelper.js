// orchestraHe.js/
var bcrypt        = require('bcryptjs'),
    crypto        = require('crypto'),
    Q             = require('q'),
    envDb         = process.env.DB,
    config        = require('./config.json'), //config file contains all tokens and other private info
    db            = require('orchestrate')(config[envDb]), //config.db holds Orchestrate token
    User          = require('../models/user.js'), 
    Profile       = require('../models/profile.js'), 
    Cart          = require('../models/cart.js'),
    RegKey        = require('../models/regkey.js'),
    rawDogger     = require('./rawDogger.js'), //rawDogger contains all of our 'tools'
    moment        = require('moment'); //used for easy timestamping

exports.generateResetToken = function(email) {
  var deferred = Q.defer();
  db.search('local-users', email)
  .then(function(result) {
    var user = result.body.results[0].value;
    user.resetToken = {token: randomString(20), createdAt: new Date()};
    db.put('local-users', user.id, user)
      .then(function (result) {
        db.put('reset-tokens', user.resetToken.token, user.resetToken)
        .then(function (results) {
            deferred.resolve(user);
        })
        .fail(function (err) {
            deferred.reject(new Error('Error creating reset token'));
        });
      })
      .fail(function(err) {
        deferred.reject(new Error(err.body.message));
      });
  })
  .fail(function (err){
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.getMerchantProductCount = function(merchantid) {
   var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('products')
  .query(merchantid)
  .then(function (res) {
    deferred.resolve(res.body.total_count);
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.addMerchantProfile = function(profile) {
  var deferred = Q.defer();
  var key = profile.name.charAt(0).toLowerCase();
  db.get('product-key-map', key)
  .then(function (result) {
    var map = result.body;
    var code = map.code;
    while (code.toString().length < 3) {
      code = "0" + code.toString();
    }
    profile.productKey = map.letter + "-" + code;
    profile.updatedAt = new Date();
    return db.put('merchant-profiles', profile.id, profile);
  })
  .then(function (result) {
    return db.newPatchBuilder('product-key-map', key)
      .inc('code', 1)
      .apply();
  })
  .then(function (result) {
    deferred.resolve(profile);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
   
  return deferred.promise;
};

exports.getProductRating = function(productnumber) {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('product-reviews')
  .aggregate('stats', 'value.rating')
  .query('`' + productnumber + '`')
  .then(function (res) {
    deferred.resolve(res.body.aggregates[0].statistics);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });

  return deferred.promise;
};

exports.activateRegKey = function(keyid, ownerid) {
  var deferred = Q.defer();
  db.get('registration-keys', keyid)
  .then(function (result) {
    var key = result.body;
    key.isActive = true;
    key.activationDate = new Date();
    key.owner = ownerid;
    return db.put('registration-keys', keyid, key);
  })
  .then(function (result) {
    deferred.resolve(result.body);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.addPageView = function(type, id, profile) {
  return db.newEventBuilder()
  .from(type, id)
  .type('page-view')
  .data({
    "profile": profile
  })
  .create();
};

exports.getMerchantByID = function(id) {
  var deferred = Q.defer();
  db.get('merchant-profiles', id)
  .then(function (merchant){
    deferred.resolve(merchant.body);
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.validateResetToken = function(tokenid) {
  var deferred = Q.defer();
   db.get('reset-tokens', tokenid)
  .then(function (token){ 
    var now = new Date();
    if(Date.parse(token.createdAt) + 86400000 < Date.parse(now)) {  //expired
      deferred.resolve(false);
    }else {
      deferred.resolve(true);
    }
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.findProviderAppts = function(profileid, office, start, end) {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('appointments')
  .limit(100)
  .range('value.date', function (builder) {
    return builder.between(start, end);
  })
  .query('value.provider: ' + profileid + ' AND value.office: ' + office)
  .then(function (result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
   
  return deferred.promise;
};

// ABSTRACTED METHODS BELOW ONLY
/////////////////////////////////////////////////////////////////////////////////////
exports.getDocFromCollection = function(collection, key) {
  var deferred = Q.defer();
  db.get(collection, key)
  .then(function (result){
    deferred.resolve(result.body);
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.listDocsFromCollection = function(collection, params) {
  var deferred = Q.defer();
  db.list(collection, params)
  .then(function (result){
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.postDocToCollection = function(collection, doc) {
  var deferred = Q.defer();
  doc.createdAt = new Date();
  doc.updatedAt = new Date();
  db.post(collection, doc)
  .then(function (result) {
    deferred.resolve(result.path);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.putDocToCollection = function(collection, id, doc) {
  var deferred = Q.defer();
  doc.updatedAt = new Date();
  db.put(collection, id, doc)
  .then(function (result) {
    deferred.resolve(result.path);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.removeDocFromCollection = function(collection, id, doc) {
  var deferred = Q.defer();
  db.remove(collection, id)
  .then(function (result) {
    deferred.resolve(true);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.searchDocsFromCollection = function(collection, query, params) {
  var deferred = Q.defer();
  db.search(collection, query, params)
  .then(function (result){
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.getMostFrequentEvent = function(collection, type, profile) {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('products')
  .aggregate('top_values', 'value.productnumber')
  .query('@path.kind:event AND @path.type:' + type)
  .then(function (result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    if (err.body.code == "items_not_found") {
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
};

exports.incrementCollectionProperty = function(collection, key, prop) {
  var deferred = Q.defer();
  db.newPatchBuilder(collection, key)
  .inc(prop)
  .apply()
  .then(function (res) {
    deferred.resolve(res.body);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};
