module.exports = function(express, app, __dirname) { 
  "use strict";

    var orchHelper      = require('../trd_modules/orchestrateHelper'),
        errorHandler    = require('../trd_modules/errorHandler.js'),
        flow            = require('../assets/js/flow-node')(process.env.TMPDIR),
        stripeEnv       = process.env.STRIPE,  
        moment          = require('moment'),
        fs              = require('fs'),
        multipart       = require('connect-multiparty'),
        multipartMiddleware = multipart(),
        jwt             = require('jwt-simple'),
        passport        = require('passport'),        // https://npmjs.org/package/passport
        BearerStrategy  = require('passport-http-bearer').Strategy,
        adminRoutes     = require('./admin-routes.js')(express, app, __dirname),
        authRoutes      = require('./auth-routes.js')(express, app, __dirname),
        awsRoutes       = require('./aws-routes.js')(express, app, __dirname),
        bookingRoutes   = require('./booking-routes.js')(express, app, __dirname),
        emailRoutes     = require('./email-routes.js')(express, app, __dirname),
        locationRoutes  = require('./location-routes.js')(express, app, __dirname),
        marketingRoutes = require('./marketing-routes.js')(express, app, __dirname),
        productRoutes   = require('./product-routes.js')(express, app, __dirname),
        profileRoutes   = require('./profile-routes.js')(express, app, __dirname),
        promoRoutes     = require('./promo-routes.js')(express, app, __dirname),
        regRoutes       = require('./reg-routes.js')(express, app, __dirname),
        storeRoutes     = require('./store-routes.js')(express, app, __dirname),
        stripeRoutes    = require('./stripe-routes.js')(express, app, __dirname),
        trainingRoutes  = require('./training-routes.js')(express, app, __dirname),
        userRoutes      = require('./user-routes.js')(express, app, __dirname);

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
                orchHelper.getDocFromCollection('local-users', decoded.user)
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

    var ensureAuthenticated = function (req, res, next) {
        return passport.authenticate('bearer', { session: false } )(req, res, next);
    };

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

    // GET upload_image
    var get_image = function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        flow.get(req, function(status, filename, original_filename, identifier) {
        if (status == 'found') {
            res.status(200).send();
        } else {
            res.status(204).send();
        }
        });
    };

    // GET upload_image
    var upload_image = function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");

        flow.post(req, function(status, filename, original_filename, identifier) {
            res.status(status).json({filename:filename, identifier:identifier});
        });
    };

    // APP ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/', index_redirect);
    app.get('/index', index_redirect);
    app.get('/home', home);
    app.get('/appjs', appjs);
    app.get('/appcss', appcss);
    app.get('/upload_image', get_image);
    // POST ////////////////////////////////////////////////////////////
    app.post('/upload_image', multipartMiddleware, upload_image);
    ////////////////////////////////////////////////////////////////////

    // ADMIN ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/admin/all_profiles', ensureAuthenticated, adminRoutes.all_profiles);
    app.get('/admin/all_products', ensureAuthenticated, adminRoutes.all_products);
    app.get('/admin/promos', ensureAuthenticated, adminRoutes.get_promos);
    app.get('/admin/profile/:profileid', ensureAuthenticated, adminRoutes.get_profile);
    app.get('/admin/all_merchants', ensureAuthenticated, adminRoutes.all_merchants);
    app.get('/admin/all_orders', ensureAuthenticated, adminRoutes.all_orders);
    app.get('/admin/all_ylift_profiles', ensureAuthenticated, adminRoutes.all_ylift_profiles);
    // POST ////////////////////////////////////////////////////////////
    app.post('/admin/add_address', ensureAuthenticated, adminRoutes.add_address);
    app.post('/admin/add_promo', ensureAuthenticated, adminRoutes.add_promo);
    app.post('/admin/delete_promo', ensureAuthenticated, adminRoutes.delete_promo);
    app.post('/admin/regkeys', ensureAuthenticated, adminRoutes.get_available_keys);
    app.post('/admin/hash', ensureAuthenticated, adminRoutes.get_hash);
    app.post('/admin/add_regkey', ensureAuthenticated, adminRoutes.add_regkey);
    app.post('/admin/update_address', ensureAuthenticated, adminRoutes.update_address);
    app.post('/admin/update_user_profile', ensureAuthenticated, adminRoutes.update_user_profile);
    app.post('/admin/profile/update_merchant', ensureAuthenticated, profileRoutes.update_merchant);
    // MIDDLEWARE //////////////////////////////////////////////////////
    app.use('/admin', ensureAuthenticated); // ensure that we're authenticated and have a user
    app.use('/admin', function(req, res, next) {
        orchHelper.getDocFromCollection('local-users', req.user.id)
          .then(function (user) {
            if (user.isAdmin) {
              next();
            } else {
              errorHandler.logAndReturn('Not an admin', 401, next);
            }
          })
          .fail(function (err) {
            errorHandler.logAndReturn('User not found', 404, next, err);
          });
      }); // ensure that we're an admin
    ////////////////////////////////////////////////////////////////////

    // AUTH ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/request_pass_reset/:email', authRoutes.request_pass_reset);
    app.get('/reset_password/:userid', authRoutes.reset_password);
    app.get('/authorized', ensureAuthenticated, authRoutes.authorized);

    // POST ////////////////////////////////////////////////////////////
    app.post('/register', authRoutes.register);
    app.post('/login', authRoutes.loginHelper);
    app.post('/update_password', authRoutes.update_password);
    ////////////////////////////////////////////////////////////////////

    // AWS ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/sign_s3', awsRoutes.sign_s3);
    // POST ////////////////////////////////////////////////////////////
    app.post('/get_object', ensureAuthenticated, awsRoutes.get_object);
    ////////////////////////////////////////////////////////////////////

    // BOOKING ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/booking/patient_appts/:patientid', ensureAuthenticated, bookingRoutes.get_patient_appts);
    // POST ////////////////////////////////////////////////////////////
    app.post('/booking/provider_appts/:providerid', bookingRoutes.get_provider_appts);
    app.post('/booking/request_appt/:providerid', ensureAuthenticated, bookingRoutes.request_appt);
    app.post('/booking/update_appt', ensureAuthenticated, bookingRoutes.update_appt);
    ////////////////////////////////////////////////////////////////////

    // PRODUCT ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/product_merchant/:productnumber', productRoutes.get_merchant);
    app.get('/get_product_by_id/:productnumber', productRoutes.get_product);
    app.get('/product_rating/:productnumber', productRoutes.get_rating);
    app.get('/product_reviews/:productnumber', productRoutes.get_reviews);
    app.get('/most_viewed_product/:profileid', ensureAuthenticated, productRoutes.most_viewed_product);
    // POST ////////////////////////////////////////////////////////////
    app.post('/add_product', ensureAuthenticated, productRoutes.add_product);
    app.post('/submit_review', ensureAuthenticated, productRoutes.submit_review);
    app.post('/product_page_view/:productnumber', productRoutes.page_view);
    app.post('/update_product', ensureAuthenticated, productRoutes.update_product);
    ////////////////////////////////////////////////////////////////////

    // PROFILE ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/profile/get_merchant/:profileid', ensureAuthenticated, profileRoutes.get_merchant);
    app.get('/profile/:profileid', profileRoutes.get_profile);
    // POST ////////////////////////////////////////////////////////////
    app.post('/profile/update/:profileid', ensureAuthenticated, profileRoutes.update_profile);
    app.post('/profile/get_merchant/:profileid', ensureAuthenticated, profileRoutes.get_merchant);
    app.post('/profile/add_merchant/:profileid', ensureAuthenticated, profileRoutes.add_merchant);
    app.post('/profile/update_merchant', ensureAuthenticated, profileRoutes.update_merchant);
    // app.post('/profile/delete_merchant/:profileid', ensureAuthenticated, profileRoutes.delete_merchant);
    ////////////////////////////////////////////////////////////////////

    // EMAIL ROUTES
    // GET /////////////////////////////////////////////////////////////
    // POST ////////////////////////////////////////////////////////////
    app.post('/email_support', emailRoutes.support);
    app.post('/change_email', ensureAuthenticated, emailRoutes.change_email);
    ////////////////////////////////////////////////////////////////////

    // LOCATION ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/ylift_locations', locationRoutes.get_ylift_locations);
    app.get('/profile/addresses/:profileid', ensureAuthenticated, locationRoutes.get_addresses);
    // POST ////////////////////////////////////////////////////////////
    app.post('/profile/add_address/:profileid', ensureAuthenticated, locationRoutes.add_address);
    app.post('/profile/remove_address/:profileid', ensureAuthenticated, locationRoutes.remove_address);
    app.post('/profile/update_address/:profileid', ensureAuthenticated, locationRoutes.update_address);
    ////////////////////////////////////////////////////////////////////

    // MARKETING ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/get_all_testimonials', marketingRoutes.get_all_testimonials);
    // POST ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////

    // PROMO ROUTES
    // GET /////////////////////////////////////////////////////////////
    // POST ////////////////////////////////////////////////////////////
    app.post('/promo/:code', promoRoutes.get_promo_code);
    ////////////////////////////////////////////////////////////////////

    // REG ROUTES
    // GET /////////////////////////////////////////////////////////////
    // POST ////////////////////////////////////////////////////////////
    app.post('/verify_key', ensureAuthenticated, regRoutes.verify_key);
    ////////////////////////////////////////////////////////////////////

    // STORE ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/merchant_orders/:merchantid', storeRoutes.merchant_orders);
    app.get('/get_products_by_merchant/:merchantid', ensureAuthenticated, storeRoutes.get_products_by_merchant);
    app.get('/cart/:profileid', ensureAuthenticated, storeRoutes.get_cart);
    app.get('/order/:orderid', storeRoutes.get_order);
    app.get('/all_orders/:profileid', ensureAuthenticated, storeRoutes.get_all_orders);
    app.get('/get_related_products/:productnumber', storeRoutes.get_related_products);
    // POST ////////////////////////////////////////////////////////////
    app.post('/add_item_to_cart', ensureAuthenticated, storeRoutes.add_item_to_cart);
    app.post('/add_check_order', storeRoutes.create_check_order);
    app.post('/empty_cart', storeRoutes.empty_cart);
    app.post('/get_products_by_category', storeRoutes.get_products_by_category);
    app.post('/get_products_by_ids', storeRoutes.get_products_by_ids);
    app.post('/store', storeRoutes.get_storefront);
    app.post('/update_cart', ensureAuthenticated, storeRoutes.update_cart);
    app.post('/update_order', ensureAuthenticated, storeRoutes.update_order);
    ////////////////////////////////////////////////////////////////////

    // STRIPE ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/get_customer/:customerid', ensureAuthenticated, stripeRoutes.get_customer);
    // POST ////////////////////////////////////////////////////////////
    app.post('/add_customer/:profileid', ensureAuthenticated, stripeRoutes.add_customer);
    app.post('/add_guest_customer', stripeRoutes.add_guest_customer);
    app.post('/add_token_to_customer/:profileid/:customerid', ensureAuthenticated, stripeRoutes.add_token_to_customer, stripeRoutes.update_customer);
    app.post('/process_transaction?:profileid', stripeRoutes.process_transaction);
    app.post('/remove_card_from_customer/:profileid/:customerid', ensureAuthenticated, stripeRoutes.remove_card_from_customer, stripeRoutes.update_customer);
    app.post('/update_customer/:profileid', ensureAuthenticated, stripeRoutes.update_customer);
    app.post('/update_guest_customer', stripeRoutes.update_guest_customer);
    ////////////////////////////////////////////////////////////////////

    // TRAINING ROUTES
    // GET /////////////////////////////////////////////////////////////
    app.get('/training_dates', trainingRoutes.get_dates);
    app.get('/training_dates/:profileid', ensureAuthenticated, trainingRoutes.get_dates_by_profile);
    // POST ////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////

    // USER ROUTES
    // GET /////////////////////////////////////////////////////////////
    // POST ////////////////////////////////////////////////////////////
    app.post('/validate_reset_token', userRoutes.validate_reset_token);
    app.post('/user/give_ylift', ensureAuthenticated, userRoutes.give_ylift);
    ////////////////////////////////////////////////////////////////////

    // ERROR ROUTES
    // GET /////////////////////////////////////////////////////////////
    // POST ////////////////////////////////////////////////////////////
    // MIDDLEWARE //////////////////////////////////////////////////////
    app.use(function (err, req, res, next) {
      res.status(err.status || 500).json({error: true, message:err.message || err.body || 'Unknown server error'});
    });
    ////////////////////////////////////////////////////////////////////

};