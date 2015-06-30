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

exports.uploadTrainingMaterials = function(filename, filecontent, userid) {
  var deferred = Q.defer();
  db.put('training-materials', filename, {name: filename, file: filecontent, user: userid})
  .then(function(result) {
    deferred.resolve(true);
  })
  .fail(function(err) {
    deferred.reject(new Error(err.body.message));
  });

  return deferred.promise;
};

exports.updateUserDoc = function(user) {
  var deferred = Q.defer();
  db.put('local-users', user.id, user)
  .then(function(result) {
    deferred.resolve(true);
  })
  .fail(function(err) {
    deferred.reject(new Error(err.body.message));
  });

  return deferred.promise;
};

exports.updateUserProfile = function(profile, userid, property) {
  var deferred = Q.defer();
  profile.updatedAt = new Date();
  db.put('local-profiles', profile.id, profile)
    .then(function (profile) {
      if(property == "name" || property == "email" || property == "picture") {
          db.get('local-users', userid)
            .then(function (user){
              var theuser = user.body;
              theuser.updatedAt = new Date();
              theuser[property] = profile[property];
              db.put('local-users', userid, theuser)
                .then(function (user) {
                  deferred.resolve(profile);
                })
                .fail(function (err) {
                  deferred.reject(new Error(err.body.message));
                });
            })
            .fail(function (err) {
              deferred.reject(new Error(err.body.message));
            });
      } else {  //field is not name or email
        deferred.resolve(profile);
      }
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });
    return deferred.promise;
};

exports.updateProfile = function(id, profile) {
  var deferred = Q.defer();
  profile.updatedAt = new Date();
  db.put('local-profiles', id, profile)
  .then(function (result) {
    deferred.resolve(profile);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
   
  return deferred.promise;
};
 
// update password
// user provides password, this updates password to their choice
exports.updatePassword = function(resettoken, password) {
  var deferred = Q.defer();
  db.search('local-users', resettoken)
    .then(function (user){
      var theuser = user.body.results[0].value; //will never not be retarded
      theuser.hash = bcrypt.hashSync(password, 8); 
      delete theuser.resetToken;
      theuser.updatedAt = new Date();
      db.put('local-users', theuser.id, theuser)
        .then(function (user) {
          db.remove('reset-tokens', resettoken)
          .then(function (result) {
            deferred.resolve(user);
          })
          .fail(function (err) {
            deferred.reject(new Error("Could not remove reset token"));
          });
        })
        .fail(function (err) {
          deferred.reject(new Error(err.body.message));
        });
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });
    return deferred.promise;
};

//generate a random alphanumeric string
//helper function for generatePassword
function randomString(length) {
    var result = '';
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}

//change password
exports.changePassword = function(id, password) {
  var deferred = Q.defer();
   db.get('local-users', id)
    .then(function (user){ //user with this email address exists in db
      user.hash = bcrypt.hashSync(password, 8); 
      user.tempPwd = false;
      db.put('local-users', id, user)
        .then(function (user) {
          deferred.resolve(user);
        })
        .fail(function (err) {
          deferred.reject(new Error(err.body.message));
        });
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });

  return deferred.promise;

};

//used in local-signup strategy
exports.localReg = function (email, password, metadata) {
  var deferred = Q.defer();
  var user = User.newUser(email, password);
  var profile = Profile.newProfile(email);
  if (metadata) {
    rawDogger.addMetaToProfile(profile, JSON.parse(metadata));
  }
  var cart = Cart.newCart();
    //check if email is already assigned in our database
  db.search('local-users', user.email)
  .then(function (result) {
    if (result.body.count > 0) {
        throw new Error('That email is already registered, please login.');
    } else {
      user.profile = profile.id;
      return db.put('local-users', user.id, user)
      .then(function (result) {
        return user;
      }, function (err) {
        throw new Error(err.body.message);
      });
    }
  })
  .then(function (user) {
    profile.cart = cart.id;
    return db.put('local-profiles', profile.id, profile)
    .then (function (result) {
      return profile;
    }, function (err) {
      throw new Error(err.body.message);
    });
  })
  .then(function (profile) {
    return db.put('carts', profile.id, cart)
    .then(function (result) {
      deferred.resolve(user);
    }, function (err) {
      throw new Error(err.body.message);
    });
  })
  .fail(function (err) {
    deferred.reject(err);
  });

  return deferred.promise;
};

exports.localAuth = function (email, password) {
  var deferred = Q.defer();
  db.search('local-users', email)
  .then(function (result){
    if (result.body.count > 0) {
      var user = result.body.results[0].value; // << this is fucking stupid and needs improved
      if (bcrypt.compareSync(password, user.hash)) {
        deferred.resolve(user);
      } else {
        deferred.reject(new Error('Invalid email/password combination, please try again.'));
      } 
    } else {
      deferred.reject(new Error('User does not exist in our system, please register.'));
    }
  })
  .fail(function (err){
    deferred.reject(err);
  });

  return deferred.promise;
};

exports.findProfileByID = function(id) { //TODO: decide if we need to store profiles by user ID for easy get
  var deferred = Q.defer();
  db.get('local-profiles', id)
  .then(function(result) {
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });

  return deferred.promise;
};

exports.findUserByToken = function(token) {
  var deferred = Q.defer();
  db.search('local-users', token)
  .then(function(result) {
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
};

exports.findUserByEmail = function(email) {
  var deferred = Q.defer();
  db.search('local-users', email)
  .then(function(result) {
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.findUserByID = function(id) {
  var deferred = Q.defer();
  db.get('local-users', id)
  .then(function(result) {
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });

  return deferred.promise;
};

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

// Simple route middleware to ensure user is authenticated.
exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/signin');
};

//check to see if user has a temporary password
exports.checkTemp = function (req) {
  return req.body.tempPwd;
};

//get all products
exports.getAllProducts = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
    .collection('products')
    .limit(100)
    .query('value.active: "Y"')
  .then(function(result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

//get all products
exports.getPublicProducts = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
    .collection('products')
    .limit(100)
    .query('value.active: "Y" AND NOT value.isYLIFT: "Y"')
  .then(function(result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.getProductByID = function(productnumber) {
  var deferred = Q.defer();
  db.get('products', productnumber)
  .then(function(product) {
    deferred.resolve(product.body);
  })
  .fail(function (err){
    if (err.body.code == 'items_not_found'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.getRelatedProducts = function(productnumber) {
  return db.get('products', productnumber)
  .then(function(result) {
    var product = result.body;
    var deferred = Q.defer();
    db.newSearchBuilder()
    .collection('products')
    .limit(4)
    .query('value.category: ' + product.category + ' AND value.active: "Y"') // balls and stuff
    .then(function (res) {
      deferred.resolve(rawDogger.push_values_to_top(res.body.results));
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });

    return deferred.promise;

  }, function (err) {
    return Q.fcall(function () {
      return false;
    });
  });
};

exports.getProductsByCategory = function(category) {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('products')
  .limit(100)
  .query('value.category: ' + product.category + ' AND value.active: "Y"') // balls and stuff
  .then(function (result){
    deferred.resolve(rawDogger.push_values_to_top(res.body.results));
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });

  return deferred.promise;
};

exports.addItemToUserCart = function(userid, productnumber, quantity) {
  var deferred = Q.defer();
  db.get('carts', userid)
  .then(function (result) {
    var cart = result.body;
    db.get('products', productnumber) // make sure they aren't ordering dog shit // unless we decide to sell dog shit
    .then(function (result) {
      //first check to see if product is already in cart
      var duplicate = false;
      for(var i = 0; i < cart.products.length; i++) {
        if(cart.products[i].productnumber == productnumber) {
          duplicate = true;
          cart.products[i].quantity = Number(cart.products[i].quantity) + Number(quantity); //if so just update quantity
          cart.status = "active";
          cart.updatedAt = new Date();
        }
      }
      if(!duplicate) {
        var productObj = {
          productnumber: productnumber,
          quantity: quantity
        };
        cart.products.push(productObj);
        cart.status = "active";
        cart.updatedAt = new Date();
      }
      db.put('carts', userid, cart)
      .then(function (result) {
        deferred.resolve(cart); // item(s) successfully added to cart
      })
      .fail(function (err) {
        deferred.reject(new Error(err.body.message));
      });
    })
    .fail(function (err) {
      if (err.body.message == 'The requested items could not be found.'){
        deferred.resolve(false);
      } else {
        deferred.reject(new Error(err.body.message));
      }
    });
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

exports.addProduct = function(product, user) {
  var deferred = Q.defer();
  product.createdAt = new Date();
  product.updatedAt = new Date();
  product.createdBy = user;
  db.put('products', product.productnumber, product)
    .then(function (result) {
      deferred.resolve(product);
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });
   
    return deferred.promise;
};

exports.getCartByID = function(profileid) {
  var deferred = Q.defer();
  db.get('carts', profileid)
  .then(function (result) {
    deferred.resolve(result.body);
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

exports.getProductKeyMap = function(key) {
  var deferred = Q.defer();
  db.get('product-key-map', key)
  .then(function (result) {
    deferred.resolve(result.body);
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

exports.updateUserCart = function(userid, productnumbers, quantities) {
  var deferred = Q.defer();
  db.get('carts', userid)
  .then(function (result) {
    var cart = result.body;
    cart.products = [];
    for (var i = 0; i < productnumbers.length; i++) {
      var productRef = {
        productnumber: null,
        quantity: null
      };
      productRef.productnumber = productnumbers[i];
      productRef.quantity = quantities[i];
      cart.products.push(productRef);
    }
    cart.updatedAt = new Date();
    cart.status = "active";
    return db.put('carts', userid, cart)
    .then(function (result) {
      deferred.resolve(cart);
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.addCustomer = function(stripeCustomer) {
  var deferred = Q.defer();
  db.put('customers', stripeCustomer.id, stripeCustomer)
  .then(function (result) {
    deferred.resolve(true);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.getCustomer = function(customerId) {
  var deferred = Q.defer();
  db.get('customers', customerId)
  .then(function (result) {
    deferred.resolve(result.body);
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

exports.addOrder = function(order) {
  var deferred = Q.defer();
  db.put('orders', order.id, order)
  .then(function (result) {
    deferred.resolve(order);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.getOrderByID = function(orderId) {
  var deferred = Q.defer();
  db.get('orders', orderId)
  .then(function (result) {
    deferred.resolve(result.body);
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

exports.getAllOrders = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('orders')
  .limit(100)
  .query('*')
  .then(function (result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body));
  });
  return deferred.promise;
};

exports.addOrderToUser = function(profileid, order) {
  var deferred = Q.defer();
  db.get('user-orders', profileid)
  .then(function (result) {
    var userorders = result.body;
    userorders.orders.push(order);
    db.put('user-orders', profileid, userorders)
    .then(function (result) {
      deferred.resolve(order);
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      var userorders = {
        user: profileid,
        orders: [ order ]
      };
      db.put('user-orders', profileid, userorders)
      .then(function (result) {
        deferred.resolve(order);
      })
      .fail(function (err) {
        deferred.reject(new Error(err.body.message));
      });
    } else {
      deferred.reject(new Error(err.body.message));
    }
  });
  return deferred.promise;
};

exports.getOrdersByUserID = function(profileid) {
  var deferred = Q.defer();
  db.get('user-orders', profileid)
  .then(function (result) {
    deferred.resolve(result.body.orders);
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

exports.emptyUserCart = function(userid) {
  var deferred = Q.defer();
  db.get('carts', userid)
  .then(function (result) {
    var cart = result.body;
    cart.products = [];
    cart.updatedAt = new Date();
    cart.status = "empty";
    db.put('carts', userid, cart)
    .then(function(result) {
      deferred.resolve(cart);
    })
    .fail(function(err) {
      deferred.reject(new Error(err.body.message));
    });
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};


exports.getAllProfiles = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('local-profiles')
  .limit(100)
  .query('*')
  .then(function (result) {
    var profiles = [];
    for (var i = 0; i < result.body.results.length; i++) {
      profiles[i] = result.body.results[i].value;
    }
    deferred.resolve(profiles);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.getAllYLIFTProfiles = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('local-users')
  .limit(100)
  .query('value.isYLIFT: true')
  .then(function (result) {
    var profileids = [];
    var users = rawDogger.push_values_to_top(result.body.results);
    for (var i = 0; i < users.length; i++) {
      if (users[i].isYLIFT) {
        profileids.push(users[i].profile);
      }
    }
    return profileids;
  })
  .then(function (profileids) {
    var promises = [];
    profileids.forEach(function (profileid, index) {
      promises.push(module.exports.getProfile(profileid));
    });
    return Q.allSettled(promises)
      .then(function (results) {
        var profiles = [];
        results.forEach(function (result) {
          if (result.state === "fulfilled") {
              profiles.push(result.value);
          }
        });
        return profiles;
      })
      .fail(function (reasons) {
        return false;
      });
  })
  .then(function (result) {
    deferred.resolve(result);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
  return deferred.promise;
};

exports.getProfile = function(profileid) {
  var deferred = Q.defer();
  db.get('local-profiles', profileid)
  .then(function (result) {
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

exports.getUser = function(userid) {
  var deferred = Q.defer();
  db.get('local-users', userid)
  .then(function (result) {
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

exports.updateMerchantProfile = function(profile) {
  var deferred = Q.defer();
  profile.updatedAt = new Date();
  db.put('merchant-profiles', profile.id, profile)
  .then(function (result) {
    deferred.resolve(profile);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
   
  return deferred.promise;
};

exports.deleteMerchantProfile = function(merchantid) {
  var deferred = Q.defer();
  db.remove('merchant-profiles', merchantid)
    .then(function (result) {
      deferred.resolve(true);
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body.message));
    });
   
    return deferred.promise;
};

exports.findMerchantProfile = function(profileid) {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('merchant-profiles')
  .query('value.owner: ' + profileid + ' OR value.members: ' + profileid)
  .then(function (res) {
    var results = rawDogger.push_values_to_top(res.body.results);
    deferred.resolve(results[0]);
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

exports.getMerchantProfile = function(profileid) {
  var deferred = Q.defer();
  db.get('merchant-profiles', profileid)
  .then(function (result) {
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

exports.getMerchantOrders = function(merchantid) {
  var deferred = Q.defer();
  db.search('orders', 'value.merchants: ' + merchantid)
  .then(function (res) {
    var results = rawDogger.push_values_to_top(res.body.results);
    deferred.resolve(results);
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

exports.getMerchantProducts = function(merchantid) {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('products')
  .limit(100)
  .query('value.attributes.vendor: ' + merchantid)
  .then(function (res) {
    var results = rawDogger.push_values_to_top(res.body.results);
    deferred.resolve(results);
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

exports.updateCustomer = function(customer) {
  var deferred = Q.defer();
  customer.updatedAt = new Date();
  db.put('customers', customer.id, customer)
  .then(function (result) {
    deferred.resolve(customer);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
   
    return deferred.promise;
};

exports.updateOrder = function(order) {
  var deferred = Q.defer();
  order.updatedAt = new Date();
  db.put('orders', order.id, order)
  .then(function (result) {
    deferred.resolve(order);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
    return deferred.promise;
};

exports.updateProduct = function(product, user) {
  var deferred = Q.defer();
  product.updatedAt = new Date();
  product.updatedBy = user;
  db.put('products', product.productnumber, product)
  .then(function (result) {
    deferred.resolve(product);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
  });
   
    return deferred.promise;
};

exports.submitReview = function(review) {
  var deferred = Q.defer();
  db.post('product-reviews', review)
  .then(function (result) {
    deferred.resolve(true);
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

exports.getProductReviews = function(productnumber) {
  var deferred = Q.defer();
  db.search('product-reviews', '`' + productnumber + '`')
  .then(function (res) {
    deferred.resolve(rawDogger.push_values_to_top(res.body.results));
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

exports.getRegKey = function(keyid) {
  var deferred = Q.defer();
  db.get('registration-keys', keyid)
    .then(function (result) {
      deferred.resolve(result.body);
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

exports.getTrainingDates = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
    .collection('training-dates')
    .limit(100)
    .query('value.available:true')
  .then(function(result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body.message));
    }
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

exports.getAllTestimonials = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('testimonials')
  .limit(100)
  .query('*')
  .then(function (result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body));
  });
  return deferred.promise;
};

exports.getAllPromoCodes = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('promo-codes')
  .limit(100)
  .query('*')
  .then(function (result) {
    deferred.resolve(rawDogger.push_values_to_top(result.body.results));
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body));
  });
   
  return deferred.promise;
};

exports.addPromo = function(promo) {
  var deferred = Q.defer();
  db.put('promo-codes', promo.key, promo)
  .then(function (result) {
    console.log('orch then', result);
    console.log('body', result.body);
    deferred.resolve(result);
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body.message));
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

