// orchestraHe.js/
var bcrypt        = require('bcryptjs'),
    crypto        = require('crypto'),
    Q             = require('q'),
    envDb         = process.env.DB,
    config        = require('./config.js'), //config file contains all tokens and other private info
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
    deferred.reject(new Error(err.body));
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
                  deferred.reject(new Error(err.body));
                });
            })
            .fail(function (err) {
              deferred.reject(new Error(err.body));
            });
      } else {  //field is not name or email
        deferred.resolve(profile);
      }
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body));
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
      deferred.reject(new Error(err.body));
    });
   
    return deferred.promise;
};
 
// update password
// user provides password, this updates password to their choice
exports.updatePassword = function(resettoken, password) {
  var deferred = Q.defer();
  db.search('local-users', resettoken)
    .then(function (user){ //reset token is valid
      var theuser = user.body.results[0].value; //will never not be retarded
      theuser.hash = bcrypt.hashSync(password, 8); 
      theuser.resettoken = null;
      db.put('local-users', theuser.id, theuser)
        .then(function (user) {
          deferred.resolve(user);
        })
        .fail(function (err) {
          deferred.reject(new Error(err.body));
        });
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body));
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
          deferred.reject(new Error(err.body));
        });
    })
    .fail(function (err) {
      deferred.reject(new Error(err.body));
      console.log("NO USER EXISTS WITH THIS EMAIL");
    });

  return deferred.promise;

};

//used in local-signup strategy
exports.localReg = function (email, password) {
  console.log('in local reg', email, password);
  var deferred = Q.defer();
  var user = User.newUser(email, password);
  var profile = Profile.newProfile(email);
  var cart = Cart.newCart();
    //check if email is already assigned in our database
  return db.search('local-users', user.email)
  .then(function (result) {
      console.log('result 1', result.body);
    if (result.body.count > 0) {
        throw new Error('That email is already registered, please login.');
    } else {
      user.profile = profile.id;
      return db.put('local-users', user.id, user)
      .then(function (result) {
        console.log('result 2', result.body);
        return user;
      }, function (err) {
        console.log('err 1', err);
        throw new Error(err.body);
      });
    }
  })
  .then(function (user) {
    console.log('user result', user);
    profile.cart = cart.id;
    return db.put('local-profiles', profile.id, profile)
    .then (function (result) {
      return profile;
    }, function (err) {
      console.log('err 2', err.body);
      throw new Error(err.body);
    });
  }, function (err) {
      console.log('err 3', err.body);
      throw new Error(err.body);
  })
  .then(function (profile) {
    console.log('profile result', profile);
    return db.put('carts', profile.id, cart)
    .then(function (result) {
      console.log('overall result/user', result.body, user);
      // sendWelcome(user.email);
      return user;
    }, function (err) {
      console.log('err 4', err.body);
      throw new Error(err.body);
    });
  }, function (err) {
    console.log('err 5', err.body);
    throw new Error(err.body);
  })
  .fail(function (err) {
    console.log('err 6', err);
    user.error = err;
    return user.error;
  });
};

exports.localAuth = function (email, password) {
  var deferred = Q.defer();
  db.search('local-users', email)
  .then(function (result){
    console.log("FOUND USER");
    var user = result.body.results[0].value; // << this is fucking stupid and needs improved
    console.log(bcrypt.compareSync(password, user.hash));
    if (bcrypt.compareSync(password, user.hash)) {
      console.log("PASSWORDS MATCH");
      deferred.resolve(user);
    } else {
      console.log("PASSWORDS NOT MATCH");
      deferred.resolve(false);
    }
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });

  return deferred.promise;
};

exports.findProfileByID = function(id) { //TODO: decide if we need to store profiles by user ID for easy get
  var deferred = Q.defer();
  db.get('local-profiles', id)
  .then(function(result) {
    console.log("FOUND PROFILE");
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND PROFILE IN DB FOR SIGNIN");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });

  return deferred.promise;
};

exports.findUserByToken = function(token) {
  var deferred = Q.defer();
  db.search('local-users', token)
  .then(function(result) {
    console.log("FOUND USER BY TOKEN");
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
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
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.findUserByID = function(id) {
  var deferred = Q.defer();
  db.get('local-users', id)
  .then(function(result) {
    console.log("FOUND USER BY ID");
    deferred.resolve(result.body);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND USER IN DB BY ID");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });

  return deferred.promise;
};

exports.generateResetToken = function(email) {
  var deferred = Q.defer();
  db.search('local-users', email)
  .then(function(result) {
    var user = result.body.results[0].value;
    user.resetToken = randomString(20);
    db.put('local-users', user.id, user)
      .then(function(result) {
        deferred.resolve(user);
      })
      .fail(function(err) {
        console.log('COULD NOT PUT USER IN DB');
        deferred.reject(new Error(err.body));
      });
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

// Simple route middleware to ensure user is authenticated.
exports.ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  req.session.error = 'Please sign in!';
  res.redirect('/signin');
};

//check to see if user has a temporary password
exports.checkTemp = function (req) {
  console.log('check temp');
  return req.body.tempPwd;
};

//get all products
exports.getAllProducts = function() {
  var deferred = Q.defer();
  db.newSearchBuilder()
    .collection('products')
    .limit(100)
    .query('*')
  .then(function(result) {
    var products = [];
    for (var i = 0; i < result.body.results.length; i++) {
      products[i] = result.body.results[i].value;
    }
    deferred.resolve(products);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND PRODUCTS IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
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
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND PRODUCT IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.getProductsByCategory = function(category) {
  var deferred = Q.defer();
  db.search('products', "value.category: " + category)
  .then(function (result){
    var products = [];
    for (var i = 0; i < result.body.results.length; i++) {
      products[i] = result.body.results[i].value;
    }
    deferred.resolve(products);
  })
  .fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND ITEMS");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });

  return deferred.promise;
};

exports.addItemToUserCart = function(userid, productnumber, quantity) {
  var deferred = Q.defer();
  console.log('getting cart collection w/ userid', userid);
  db.get('carts', userid)
  .then(function (result) {
    console.log("CART FOUND");
    var cart = result.body;
    db.get('products', productnumber) // make sure they aren't ordering dog shit
    .then(function (result) {
      console.log("PRODUCT FOUND");
      var product = result.body;
      var productObj = {
        productnumber: productnumber,
        quantity: quantity
      };
      cart.products.push(productObj);
      cart.status = "active";
      cart.updatedAt = new Date();
      db.put('carts', userid, cart)
      .then(function (result) {
        deferred.resolve(cart); // item(s) successfully added to cart
      })
      .fail(function (err) {
        console.log("STILL NO IDEA HOW THIS COULD HAPPEN");
        deferred.reject(new Error(err.body));
      });
    })
    .fail(function (err) {
      if (err.body.message == 'The requested items could not be found.'){
        console.log("COULD NOT FIND PRODUCT IN DB");
        deferred.resolve(false);
      } else {
        deferred.reject(new Error(err.body));
      }
    });
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND CART IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.getCartByID = function(profileid) {
  var deferred = Q.defer();
  db.get('carts', profileid)
  .then(function (result) {
    console.log("FOUND CART");
    deferred.resolve(result.body);
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND CART IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
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
      console.log("CART PUT");
      deferred.resolve(cart);
    })
    .fail(function (err) {
      console.log("ERROR IN CART PUT");
      console.log(err.body);
      deferred.reject(new Error(err.body));
    });
  })
  .fail(function (err) {
    console.log("ERROR IN CART GET");
    deferred.reject(new Error(err.body));
  });
  return deferred.promise;
};

exports.addCustomer = function(stripeCustomer) {
  console.log('hello add customer');
  var deferred = Q.defer();
  db.put('customers', stripeCustomer.id, stripeCustomer)
  .then(function (result) {
    console.log("CUSTOMER PUT");
    deferred.resolve(true);
  })
  .fail(function (err) {
    console.log("ERROR IN CUSTOMER PUT");
    deferred.reject(new Error(err.body));
  });
  return deferred.promise;
};

exports.getCustomer = function(customerId) {
  var deferred = Q.defer();
  db.get('customers', customerId)
  .then(function (result) {
    console.log("FOUND CUSTOMER");
    deferred.resolve(result.body);
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND CUSTOMER IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.addOrder = function(order) {
  var deferred = Q.defer();
  db.put('orders', order.id, order)
  .then(function (result) {
    console.log("ORDER PUT");
    deferred.resolve(order);
  })
  .fail(function (err) {
    console.log("ERROR IN ORDER PUT");
    deferred.reject(new Error(err.body));
  });
  return deferred.promise;
};

exports.getOrderByID = function(orderId) {
  var deferred = Q.defer();
  db.get('orders', orderId)
  .then(function (result) {
    console.log("GOT ORDER");
    deferred.resolve(result.body);
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND ORDER IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.addOrderToUser = function(profileid, order) {
  console.log('adding order to user!', profileid);
  var deferred = Q.defer();
  db.get('user-orders', profileid)
  .then(function (result) {
    var userorders = result.body;
    userorders.orders.push(order);
    db.put('user-orders', profileid, userorders)
    .then(function (result) {
      console.log("USER SECOND+ ORDER PUT");
      deferred.resolve(order);
    })
    .fail(function (err) {
      console.log("ERROR IN ORDER PUT");
      deferred.reject(new Error(err.body));
    });
  })
  .fail(function (err) {
    console.log('failed to get orders for user', profileid, err.body);
    if (err.body.message == 'The requested items could not be found.'){
      var userorders = {
        user: profileid,
        orders: [ order ]
      };
      db.put('user-orders', profileid, userorders)
      .then(function (result) {
        console.log("USER FIRST ORDER PUT");
        deferred.resolve(order);
      })
      .fail(function (err) {
        console.log("ERROR IN ORDER PUT");
        deferred.reject(new Error(err.body));
      });
    } else {
      console.log('error from retrieving user', err.body);
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.getOrdersByUserID = function(profileid) {
  var deferred = Q.defer();
  db.get('user-orders', profileid)
  .then(function (result) {
    console.log("GOT USER ORDERS");
    deferred.resolve(result.body.orders);
  })
  .fail(function (err) {
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND USER ORDER IN DB");
      deferred.resolve(false);
    } else {
      deferred.reject(new Error(err.body));
    }
  });
  return deferred.promise;
};

exports.emptyUserCart = function(userid) {
  var deferred = Q.defer();
  db.get('carts', userid)
  .then(function (result) {
    console.log('get carts', result.body);
    var cart = result.body;
    cart.products = [];
    cart.updatedAt = new Date();
    cart.status = "empty";
    db.put('carts', userid, cart)
    .then(function(result) {
      console.log('put carts', result.body);
      deferred.resolve(cart);
    })
    .fail(function(err) {
      console.log('put carts error', err.body);
      deferred.reject(new Error(err.body));
    });
  })
  .fail(function (err) {
    console.log('take it deep', err.body);
    deferred.reject(new Error(err.body));
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
    deferred.reject(new Error(err.body));
  });
  return deferred.promise;
};

exports.getProfile = function(profileid) {
  console.log('getting profile', profileid);
  var deferred = Q.defer();
  db.get('local-profiles', profileid)
    .then(function (result) {
      console.log('GOT PROFILE', result.body);
      deferred.resolve(result.body);
    })
    .fail(function (err) {
      console.log('NO PROFILE', err);
      deferred.reject(new Error(err.body));
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
      deferred.reject(new Error(err.body));
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
    deferred.reject(new Error(err.body));
  });

  return deferred.promise;
};

exports.getProductRating = function(productnumber) {
  console.log('getting product rating for', productnumber);
  var deferred = Q.defer();
  db.newSearchBuilder()
  .collection('product-reviews')
  .aggregate('stats', 'value.rating')
  .query('`' + productnumber + '`')
  .then(function (res) {
    console.log('result from getting product rating', res.body.aggregates[0].statistics);
    deferred.resolve(res.body.aggregates[0].statistics);
  })
  .fail(function (err) {
    console.log('error getting product rating', err.body);
    deferred.reject(new Error(err.body));
  });

  return deferred.promise;
};

exports.getProductReviews = function(productnumber) {
  console.log('getting product reviews for', productnumber);
  var deferred = Q.defer();
  db.search('product-reviews', '`' + productnumber + '`')
  .then(function (res) {
    deferred.resolve(rawDogger.push_values_to_top(res.body.results));
  })
  .fail(function (err) {
    deferred.reject(new Error(err.body));
  });

  return deferred.promise;
};