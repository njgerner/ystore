module.exports = function(express, app, __dirname) { 
  "use strict";

  var path            = require('path'),            // http://nodejs.org/docs/v0.3.1/api/path.html
      passport        = require('passport'),        // https://npmjs.org/package/passport
      orchHelper      = require('../trd_modules/orchestrateHelper'),
      config          = require('../trd_modules/config'),
      moment          = require('moment'),
      multer          = require('multer'),
      fs              = require('fs'),
      LocalStrategy   = require('passport-local').Strategy,  // See above
      BearerStrategy  = require('passport-http-bearer').Strategy,
      jwt             = require('jwt-simple'),
      nodemailer      = require('nodemailer'),
      adminRoutes     = require('./admin-routes.js')(express, app, __dirname),
      emailRoutes     = require('./email-routes.js')(express, app, __dirname),
      profileRoutes   = require('./profile-routes.js')(express, app, __dirname),
      stripeRoutes    = require('./stripe-routes.js')(express, app, __dirname),
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
          pass: "yliftDEEZNUTS!"
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
        console.log("COULD NOT LOG IN");
        var err = 'Invalid email or password. Please try again.'; //inform user could not log them in
        done(err, false);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  { usernameField: 'email',
    passwordField: 'password',
    passReqToCallback : true }, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    orchHelper.localReg(req.body.email, req.body.password)
      .then(function (user) {
        console.log('localReg ran', user);
        if (user) {
          if (!user.error) {
              mailOptions.to = user.email;
              mailOptions.subject = 'Welcome to Something!';
              mailOptions.html = {path: './views/email_templates/welcome_email.html'};
              transport.sendMail(mailOptions);
              done(null, user);
          } else {
            console.log("COULD NOT REGISTER - BAD INPUT");
            done(user.error);
          }
        }
        if (!user) {
          console.log("COULD NOT REGISTER");
          req.session.error = 'There was an error on our end, please try registering again or contact the YLift Support Team.'; //inform user could not log them in
          done(null, false);
        }
      })
      .fail(function (err){
        console.log(err);
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
                  console.log("DESERIALIZATION FAILED!!!!");
                  return done(null, false);
                }
              })
              .fail(function (err) {
                return done(err);
              });
          }
        }
      } catch (err) {
        console.log('error caught in bearer', err);
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
    res.redirect('/portal');
  };

  var portal = function(req, res) {
    res.sendFile('views/main.html', { root: __dirname });
  };

  var ensureAuthenticated = function (req, res, next) {
    return passport.authenticate('bearer', { session: false } )(req, res, next);
  };

    //GET /authorized
  ///////////////////////////////////////////////////////////////
  var authorized = function(req, res){
    res.type('application/json');
    console.log('req things body/user', req.body, req.user);
    delete req.user.hash;
    delete req.user.salt;
    orchHelper.findProfileByID(req.user.profile)
      .then(function (profile) {
        orchHelper.findUserByID(req.user.id)
          .then(function (user) {
            res.send({user:user, profile:profile, isAdmin:user.isAdmin, stripePubKey:config[stripeEnv].PUBLISH}); //eliminate the user doc ASAP
          })
          .fail(function (err) {
            console.log('need to decide what data to pass back on err', err);
          });
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
            console.log('no authorized user with this token, go to index');
            res.json({message: "Invalid token."});
          }
        })
        .fail(function (err) {

        });
    } else {
      res.redirect("/portal");
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
        mailOptions.text = 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste into your browser to complete the process' + '\n\n' + 
            'http://' + req.get('host') + '/portal#/reset_password/' + user.resetToken + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.';

        transport.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
            }else{
                res.send('success');
            }
        });
      })
      .fail(function (err) {
        res.send('No account was found with this email');
      });
  };

  // GET /all_profiles
  var all_profiles = function(req, res) {
    orchHelper.getAllProfiles()
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
        console.log("error updating password:", err);
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
      if (err) { return res.json({err: "there was an error", status:"error registering, please try again" }); } //TODO: make this better
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
        res.status(201).json({cart:cart}); // does this work??
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
        console.log('then result', cart);
        res.status(200).json({cart:cart});
      })
      .fail(function (err) {
        console.log('error', err);
        res.status(500).json({err:err});
      });
  };

  // multer middleware setup
  var setUploadDest = function(req, res, next) {
    var done = false;
    return multer({dest: './uploads/',
      rename: function(fieldname, filename, req, res) {
        console.log('renaming...', fieldname, filename);
        return filename;
      },
      changeDest: function(dest, req, res) {
        console.log('setting upload destination to ' + dest + req.body.path);
        return dest + req.body.path;
      },
      onFileUploadStart: function (file) {
        console.log(file.originalname + ' is starting ...', file);
      },
      onFileUploadComplete: function (file) {
        console.log(file.fieldname + ' uploaded to  ' + file.path);
        done=true;
        res.json({result:"successful upload"}); // send success response here even though we're not done w/ s3
      },
      onError: function (error, next) {
        console.log('somethign fucking happened', error);
        res.json({err:error});
      }
    })(req, res, next);
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
        orchHelper.findUserById(req.user._id)
          .then(function (user) {
            if (user.isAdmin) {
              next();
            } else {
              res.status(401).send("not an admin");
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
    app.get('/portal', portal);
    app.get('/appjs', appjs);
    app.get('/appcss', appcss);

    app.get('/all_orders/:profileid', ensureAuthenticated, get_all_orders);
    app.get('/all_products', all_products);
    app.get('/all_profiles', all_profiles);
    app.get('/authorized', ensureAuthenticated, authorized);
    app.get('/cart/:profileid', ensureAuthenticated, get_cart);
    app.get('/get_customer/:customerid', ensureAuthenticated, stripeRoutes.get_customer);
    app.get('/get_product_by_id/:productnumber', get_product_by_id);
    app.get('/login', login);
    app.get('/order/:orderid', get_order_by_id);
    app.get('/request_pass_reset/:email', request_pass_reset);
    app.get('/reset_password/:userid', reset_password);
    // app.get('/training', adminRoutes.training);

    // -- START POST Routes
    ///////////////////////////////////////////////////////////////
    app.post('/add_customer/:profileid', ensureAuthenticated, stripeRoutes.add_customer);
    app.post('/add_guest_customer', stripeRoutes.add_guest_customer);
    app.post('/add_item_to_cart', add_item_to_cart);
    app.post('/add_token_to_customer/:profileid/:customerid', ensureAuthenticated, stripeRoutes.add_token_to_customer, stripeRoutes.update_customer);
    app.post('/empty_cart', empty_cart);
    app.post('/email_support', emailRoutes.support);
    app.post('/get_products_by_category/:category', get_products_by_category);
    app.post('/login', loginHelper);
    app.post('/process_transaction?:profileid', stripeRoutes.process_transaction);
    app.post('/register', register);
    app.post('/remove_card_from_customer/:profileid/:customerid', ensureAuthenticated, stripeRoutes.remove_card_from_customer, stripeRoutes.update_customer);
    app.post('/update_cart', update_cart);
    app.post('/update_customer/:profileid', ensureAuthenticated, stripeRoutes.update_customer);
    app.post('/update_password', update_password);
    app.post('/update_user', ensureAuthenticated, update_user);
    // -- START Profile Routes
    ///////////////////////////////////////////////////////////////
    app.post('/profile/update/:profileid', ensureAuthenticated, profileRoutes.update_profile);

    // -- START ERROR Routes
    ///////////////////////////////////////////////////////////////
    app.get('/404', fourofour);
    app.get('/403', fourothree);
    app.get('/500', fivehundred);

    // -- End ERROR Routes
};
