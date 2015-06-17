module.exports = function(express, app, __dirname) { 
  "use strict";

  var path            = require('path'),            // http://nodejs.org/docs/v0.3.1/api/path.html
      passport        = require('passport'),        // https://npmjs.org/package/passport
      orchHelper      = require('../trd_modules/orchestrateHelper'),
      emailHelper     = require('../trd_modules/emailHelper'),
      flow            = require('../assets/js/flow-node')(process.env.TMPDIR),
      config          = require('../trd_modules/config.json'),
      moment          = require('moment'),
      multer          = require('multer'),
      fs              = require('fs'),
      LocalStrategy   = require('passport-local').Strategy,  // See above
      BearerStrategy  = require('passport-http-bearer').Strategy,
      jwt             = require('jwt-simple'),
      nodemailer      = require('nodemailer'),
      adminRoutes     = require('./admin-routes.js')(express, app, __dirname),
      awsRoutes       = require('./aws-routes.js')(express, app, __dirname),
      emailRoutes     = require('./email-routes.js')(express, app, __dirname),
      profileRoutes   = require('./profile-routes.js')(express, app, __dirname),
      productRoutes   = require('./product-routes.js')(express, app, __dirname),
      regRoutes       = require('./reg-routes.js')(express, app, __dirname),
      storeRoutes     = require('./store-routes.js')(express, app, __dirname),
      stripeRoutes    = require('./stripe-routes.js')(express, app, __dirname),
      trainingRoutes  = require('./training-routes.js')(express, app, __dirname),
      userRoutes      = require('./user-routes.js')(express, app, __dirname),
      qt              = require('quickthumb'),
      multipart       = require('connect-multiparty'),
      multipartMiddleware = multipart(),
      util            = require('util'),
      Q               = require('q'),               // https://registry.npmjs.org/q
      stripeEnv       = process.env.STRIPE;

  var mailOptions = {
    from:'support@ylift.io'
  };

  // create reusable transport method (opens pool of SMTP connections)
  var transport = nodemailer.createTransport({
      host:'smtp.office365.com',
      secureConnection: true,
      port: '587',
      auth: {
          user: "support@ylift.io",
          pass: "Wula9252"
      }
  });    

// Use the LocalStrategy within Passport to login/”signin” users.
passport.use('local-signin', new LocalStrategy(
  { usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true }, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    orchHelper.localAuth(username, password)
    .then(function (user) {
      if (user) {
        if(user.tempPwd) { //check if user has temporary password from a reset
            req.cookies.tempPwdRedirect = true; //if so update cookie so they will be redirected to update password
        }
        req.session.success = 'You are successfully logged in as ' + user.name;
        done(null, user);
      }
      if (!user) {
        var err = 'Invalid email or password. Please try again.'; //inform user could not log them in
        done(err, false);
      }
    })
    .fail(function (err){
      done('Invalid email/password combination', false);
    });
  }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  { usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true }, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    orchHelper.localReg(req.body.email, req.body.password, req.body.metadata)
      .then(function (user) {
        if (user) {
          if (!user.error) {
            emailHelper.sendWelcome(user.name, user.email)
            .then(function() {
              emailHelper.newUserTeamNotification(user)
              .then(function(result) {
                done(null,user);
              })
              .fail(function(err) {
                done(null, user, err);
              });
            })
            .fail(function(err) {
              done(null, user, err);
            });
          } else {
            done(user.error);
          }
        }
        if (!user) {
          req.session.error = 'There was an error on our end, please try registering again or contact the YLift Support Team.'; //inform user could not log them in
          done(null, false);
        }
      })
      .fail(function (err){
        done(err);
      });
  }
));

// Use the BearerStrategy within Passport.
//   Strategies in Passport require a `validate` function, which accept
//   credentials (in this case, a token), and invoke a callback with a user
//   object.
passport.use('bearer', new BearerStrategy(

  function(token, done) { // is req necessary?
    process.nextTick(function () {
      try {
      // asynchronous validation, for effect..
        var decoded = jwt.decode(token, app.get("jwtTokenSecret"));
        if (!decoded.user || !decoded.expires) {
          return done(null, false, { message: "missing user or expiration" });
        } else {
          var now = moment();
          if (decoded.expires <= now) {
            return done(null, false, { message: "token expired" });
          } else {
            orchHelper.findUserByID(decoded.user)
              .then(function (user) {
                if (user) {
                  return done(null, user);
                } else {
                  return done(null, false);
                }
              })
              .fail(function (err) {
                return done(err);
              });
          }
        }
      } catch (err) {
        return done(err, false);
      }
    });
  }
));

  //============ROUTES==================//
  // GET /appjs
  var appjs = function(req, res) {
    if (process.env.ENV == "DEV") {
      res.sendFile('public/js/trdapp.js', { root: __dirname });
    } else {
      res.sendFile('public/js/trdapp.min.js', { root: __dirname });
    }
  };

  // GET /appcss
  var appcss = function(req, res) {
    if (process.env.ENV == "DEV") {
      res.sendFile('public/css/trdapp.css', { root: __dirname });
    } else {
      res.sendFile('public/css/trdapp.min.css', { root: __dirname });
    }
  };

  // GET /
  var index_redirect = function(req, res){
    res.redirect('/home');
  };

  var home = function(req, res) {
    res.sendFile('views/main.html', { root: __dirname });
  };

  var ensureAuthenticated = function (req, res, next) {
    return passport.authenticate('bearer', { session: false } )(req, res, next);
  };

    //GET /authorized
  ///////////////////////////////////////////////////////////////
  var authorized = function(req, res){
    res.type('application/json');
    delete req.user.hash;
    delete req.user.salt;
    orchHelper.findProfileByID(req.user.profile)
      .then(function (profile) {
        orchHelper.findUserByID(req.user.id)
          .then(function (user) {
            res.send({user:user, profile:profile, isAdmin:user.isAdmin, isYLIFT:user.isYLIFT}); //eliminate the user doc ASAP
            profile.last_login = new Date();
            return orchHelper.updateProfile(profile.id, profile);
          })
          .fail(function (err) {
            console.log('need to decide what data to pass back on err', err);
          }).done();
      })
      .fail(function (err) {
        console.log('need to decide what data to pass back on err', err);
      });
  };

  //GET /login  ??? POST
  var login =function(req, res){
    if (req.query.token) {
      // if there's a token, attempt to authenticate now
      orchHelper.findUserByToken(req.query.token)
        .then(function (user) {
          if (user) {
            user.jsonType = "user";
            delete user.token;
            orchHelper.createUserSession(user)
              .then(function (session) {
                req.body.email = user.email;
                req.body.password = "mitchesgetstitches"; // hack to appease passport
                req.tokenAuthenticate = true;
                req.tokenHash = user.hash;
                loginHelper(req, res);
              })
              .fail(function (err) {
                res.json({message: "Token validation failed. Mitched it."});
              });
          } else {
            res.json({message: "Invalid token."});
          }
        })
        .fail(function (err) {
          res.json({message: "That email is not yet registered, please click register and signup."});
        });
    } else {
      res.redirect("/home");
    }
  };

  // POST /login
  var loginHelper = function(req, res, next) {

    return passport.authenticate('local-signin', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.json({err:"login helper, no user error", message:info.message, failed:true}); }

      // no sessions, don't bother logging in...
      var payload = { user: user.id, expires: moment().add(4, 'days') };
      var secret = app.get("jwtTokenSecret");

      // encode
      var token = jwt.encode(payload, secret);
      return res.json({err:null, tkn:token, tempPwd:req.cookies.tempPwdRedirect || null, stripePubKey:config[stripeEnv].PUBLISH});
    })(req, res, next);
  };

  //POST /request_pass_reset
  //an email has been sent to user asking if they want to reset password
  var request_pass_reset = function(req, res) {
    orchHelper.generateResetToken(req.params.email)
      .then(function (user) {
        mailOptions.to = user.email;
        mailOptions.subject = 'Password Reset';
        mailOptions.text = 'A request for a password reset has been made for the account linked to this email address\n\n' +
            'Please click on the following link, or paste into your browser to complete the process' + '\n\n' + 
            'http://' + req.get('host') + '/home#/reset_password/' + user.resetToken.token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.';

        transport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log('pw reset email error', error);
                res.send('An error occurred. If this persists, please contact support@ylift.io');
            }else{
                res.send('success');
            }
        });
      })
      .fail(function (err) {
        res.send('No account was found with this email');
      });
  };

  // GET /all_ylift_profiles
  var all_ylift_profiles = function(req, res) {
    orchHelper.getAllYLIFTProfiles()
      .then(function (result) {
        res.send({profiles:result});
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  //GET /reset_password
  //user has received email and confirmed they want to reset password
  var reset_password = function(req, res) {
    res.render('reset_password', {resettoken: req.params.resettoken});
  };

  var update_password = function(req, res) {
      orchHelper.updatePassword(req.body.resettoken, req.body.password)
      .then(function (user) {
        res.send({success:true});
      })
      .fail(function (err) {
        res.send({error:err});
      });
  };

  var update_user = function(req, res) {
    orchHelper.updateUserProfile(req.body.profile, req.body.userid, req.body.property)
    .then(function (profile) {
        res.send({profile: profile});
      })
    .fail(function (err) {
      res.send({err:err});
    });
  };
 
  //POST /register
  ///////////////////////////////////////////////////////////////
  var register = function(req, res) {
    return passport.authenticate('local-signup', function(err, user) { 
      if (err) { return res.json({err: "there was an error", status:"Error registering, please try again. If this issue continues, please contact support@ylift.io." }); } //TODO: make this better
      if (!user) { return res.json({err:"login helper, no user error", message:"registered, but there was an error creating a user profile", failed:true}); }
      var payload = { user: user.id, expires: moment().add(4, 'days') };
      var secret = app.get("jwtTokenSecret");
      var token = jwt.encode(payload, secret);
      return res.json({tkn:token, status:"store"});
    })(req, res);
  };

  ///GET /all_products
  var all_products = function(req, res) {
    orchHelper.getAllProducts()
      .then(function (products) {
        if (products) {
          res.send({products: products});
        } else {
          res.send({err:'no products in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  var get_product_by_id = function(req, res) {
    orchHelper.getProductByID(req.params.productnumber)
      .then(function (result) {
        if (result) {
          res.send({product: result});
        } else {
          res.send({err:'no products in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  var get_related_products = function(req, res) {
    orchHelper.getRelatedProducts(req.params.productnumber)
      .then(function (result) {
        if (result) {
          res.send({products: result});
        } else {
          res.send({err:'no related products in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  var get_products_by_category = function(req, res) {
    orchHelper.getProductsByCategory(req.body.category)
      .then(function (result) {
        if (result) {
          res.send({products: result});
        } else {
          res.send({err:'no products in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  var get_cart = function(req, res) {
    orchHelper.getCartByID(req.params.profileid)
      .then(function (result) {
        if (result) {
          res.send({cart: result});
        } else {
          res.send({err:'no cart in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  // GET get_order_by_id/:orderid
  var get_order_by_id = function(req, res) {
    orchHelper.getOrderByID(req.params.orderid)
      .then(function (result) {
        if (result) {
          res.send({order: result});
        } else {
          res.send({err:'no order in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  // GET get_all_orders/:profileid
  var get_all_orders = function(req, res) {
    orchHelper.getOrdersByUserID(req.params.profileid)
      .then(function (result) {
        if (result) {
          res.send({orders: result});
        } else {
          res.send({err:'no orders for this user in db'});
        }
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };
  // GET images/offices/:path
  var get_office_image = function(req, res, next) {
    req.body.path = 'office-images/' + req.params.path + '.jpg';
    fs.exists('./uploads/' + req.body.path, function (exists) {
      if (exists) {
        res.sendFile('./uploads/' + req.body.path, { root: __dirname });
        return;
      } else {
        next();
      }
    });
  };

  // GET images/profiles/:profileid
  var get_profile_image = function(req, res, next) {
    req.body.path = 'profile-images/' + req.params.profileid + '.jpg';
    fs.exists('./uploads/' + req.body.path, function (exists) {
      if (exists) {
        res.sendFile('./uploads/' + req.body.path, { root: __dirname });
        return;
      } else {
        next();
      }
    });
  };

  // POST add_item_to_cart
  var add_item_to_cart = function(req, res) {
    orchHelper.addItemToUserCart(req.body.profileid, req.body.productnumber, req.body.quantity)
      .then(function (cart) {
        res.status(201).json({cart:cart}); // does this work?? // lol
      })
      .fail(function (err) {
        res.status(500).json({err:err});
      });
  };

  // POST update_cart/:userid
  var update_cart = function(req, res) {
    orchHelper.updateUserCart(req.body.profileid, req.body.productnumbers, req.body.quantities)
      .then(function (cart) {
        res.send({cart:cart});
      })
      .fail(function (err) {
        res.send({err:err});
      });
  };

  // POST empty_cart/:userid
  var empty_cart = function(req, res) {
    orchHelper.emptyUserCart(req.body.profileid)
      .then(function (cart) {
        res.status(200).json({cart:cart});
      })
      .fail(function (err) {
        res.status(500).json({err:err});
      });
  };

  var get_image = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    flow.get(req, function(status, filename, original_filename, identifier) {
      console.log('GET IMAGE', status);
      if (status == 'found') {
        res.status(200).send();
      } else {
        res.status(204).send();
      }
    });
  };

  var upload_image = function(req, res) {
    res.header("Access-Control-Allow-Origin", "*");

    flow.post(req, function(status, filename, original_filename, identifier) {
      res.status(status).json({filename:filename, identifier:identifier});
    });
  };

  var get_all_testimonials = function(req, res) {
    console.log('in route');
    orchHelper.getAllTestimonials()
    .then(function (testimonials) {
      res.send({testimonials: testimonials});
    })
    .fail(function (err) {
      res.send({error:err});
    });
  };

  ///GET /404
  var fourofour = function(req, res, next){
    // trigger a 404 since no other middleware
    // will match /404 after this one, and we're not
    // responding here
    next();
  };

  ///GET /403
  var fourothree = function(req, res, next){
    // trigger a 403 error
    var err = new Error('Not Allowed!');
    err.status = 403;

    // respond with html page
    if (req.accepts('html')) {
      res.render('403', { 
        err: err,
        //url: req.url 
      });
      return;
    }

    // respond with json
    if (req.accepts('json')) {
      res.send({ error: 'Not Allowed!' });
      return;
    }

    // default to plain-text. send()
    res.type('txt').send('Not Allowed!');

    next(err);
  };

  ///GET /500
  var fivehundred = function(req, res, next){
    // trigger a generic (500) error
    next(new Error('Testing 1,2,3!'));
  };

  /* ==============================================================
    Here's all the routing
  =============================================================== */
    // --- START USE Routes
    ///////////////////////////////////////////////////////////////
    app.use('/admin', ensureAuthenticated); // ensure that we're authenticated and have a user
    app.use('/admin', function(req, res, next) {
        orchHelper.getUser(req.user.id)
          .then(function (user) {
            if (user.isAdmin) {
              next();
            } else {
              res.status(401).send("Not an admin");
            }
          })
          .fail(function (err) {
            console.log('need to handle err in /admin');
          });
      }); // ensure that we're an admin

    // --- START GET Routes
    ///////////////////////////////////////////////////////////////
    app.get('/', index_redirect);
    app.get('/index', index_redirect);
    app.get('/home', home);
    app.get('/appjs', appjs);
    app.get('/appcss', appcss);

    app.get('/all_orders/:profileid', ensureAuthenticated, get_all_orders);
    app.get('/all_products', all_products);
    app.get('/all_ylift_profiles', all_ylift_profiles);
    app.get('/authorized', ensureAuthenticated, authorized);
    app.get('/cart/:profileid', ensureAuthenticated, get_cart);
    app.get('/get_all_testimonials', get_all_testimonials);
    app.get('/get_customer/:customerid', ensureAuthenticated, stripeRoutes.get_customer);
    app.get('/merchant_orders/:merchantid', storeRoutes.merchant_orders);
    app.get('/get_product_by_id/:productnumber', get_product_by_id);
    app.get('/get_products_by_merchant/:merchantid', ensureAuthenticated, storeRoutes.get_products_by_merchant);
    app.get('/get_related_products/:productnumber', get_related_products);
    app.get('/login', login);
    app.get('/most_viewed_product/:profileid', ensureAuthenticated, productRoutes.most_viewed_product);
    app.get('/order/:orderid', get_order_by_id);
    app.get('/product_rating/:productnumber', productRoutes.get_rating);
    app.get('/product_reviews/:productnumber', productRoutes.get_reviews);
    app.get('/request_pass_reset/:email', request_pass_reset);
    app.get('/reset_password/:userid', reset_password);
    app.get('/sign_s3', awsRoutes.sign_s3);
    app.get('/training_dates', trainingRoutes.get_dates);
    app.get('/upload_image', get_image);

    // -- START POST Routes
    ///////////////////////////////////////////////////////////////
    app.post('/add_customer/:profileid', ensureAuthenticated, stripeRoutes.add_customer);
    app.post('/add_guest_customer', stripeRoutes.add_guest_customer);
    app.post('/add_check_order', storeRoutes.create_check_order);
    app.post('/add_item_to_cart', add_item_to_cart);
    app.post('/add_product', ensureAuthenticated, productRoutes.add_product);
    app.post('/add_token_to_customer/:profileid/:customerid', ensureAuthenticated, stripeRoutes.add_token_to_customer, stripeRoutes.update_customer);
    app.post('/empty_cart', empty_cart);
    app.post('/email_support', emailRoutes.support);
    app.post('/deactivate_product', ensureAuthenticated, productRoutes.deactivate_product);
    app.post('/get_products_by_category/:category', get_products_by_category);
    app.post('/login', loginHelper);
    app.post('/process_transaction?:profileid', stripeRoutes.process_transaction);
    app.post('/product_page_view/:productnumber', productRoutes.page_view);
    app.post('/register', register);
    app.post('/remove_card_from_customer/:profileid/:customerid', ensureAuthenticated, stripeRoutes.remove_card_from_customer, stripeRoutes.update_customer);
    app.post('/submit_review', ensureAuthenticated, productRoutes.submit_review);
    app.post('/verify_key', ensureAuthenticated, regRoutes.verify_key);
    app.post('/update_cart', update_cart);
    app.post('/update_customer/:profileid', ensureAuthenticated, stripeRoutes.update_customer);
    app.post('/update_guest_customer', stripeRoutes.update_guest_customer);
    app.post('/update_order', ensureAuthenticated, storeRoutes.update_order);
    app.post('/update_password', update_password);
    app.post('/update_product', ensureAuthenticated, productRoutes.update_product);
    app.post('/update_user', ensureAuthenticated, update_user);
    app.post('/upload_image', multipartMiddleware, upload_image);
    app.post('/validate_reset_token', userRoutes.validate_reset_token);
    
    // -- START Profile Routes
    ///////////////////////////////////////////////////////////////
    app.get('/profile/get_merchant/:profileid', ensureAuthenticated, profileRoutes.get_merchant);
    app.post('/profile/update/:profileid', ensureAuthenticated, profileRoutes.update_profile);
    app.post('/profile/get_merchant/:profileid', ensureAuthenticated, profileRoutes.get_merchant);
    app.post('/profile/add_merchant/:profileid', ensureAuthenticated, profileRoutes.add_merchant);
    app.post('/profile/update_merchant', ensureAuthenticated, profileRoutes.update_merchant);
    app.post('/profile/delete_merchant/:profileid', ensureAuthenticated, profileRoutes.delete_merchant);

    // -- START User Routes
    app.post('/user/give_ylift', ensureAuthenticated, userRoutes.give_ylift);

    // -- START ERROR Routes
    ///////////////////////////////////////////////////////////////
    app.get('/404', fourofour);
    app.get('/403', fourothree);
    app.get('/500', fivehundred);

    // -- End ERROR Routes

    // -- START Admin Routes
    ///////////////////////////////////////////////////////////////
    app.get('/admin/all_profiles', ensureAuthenticated, adminRoutes.all_profiles);
    app.get('/admin/all_orders', ensureAuthenticated, adminRoutes.all_orders);
    app.get('/admin/all_ylift_profiles', ensureAuthenticated, adminRoutes.all_ylift_profiles);
    // -- End ERROR Routes

};
