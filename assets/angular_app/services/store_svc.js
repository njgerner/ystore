trdServices.service("storeService", ['$rootScope', '$http', '$cookieStore', 'stripeService',
    function ($rootScope, $http, $cookieStore, stripeService) {

    this.productsReceived = false;
    this.cartReceived = false;
    this.ordersReceived = false;
    this.productsInCart = [];
    this.products = [];
    this.productsByID = {};
    this.productsByCategory = {};
    this.orders = [];
    this.ordersByID = {};
    this.cart = {};

    this.getAllProducts = function(callback) {
        if (this.productsReceived) {
            callback(this.products);
        } else {
        var internalThis = this;
        $http({method: 'GET', url: "/all_products"})
            .success(function(data, status, headers, config) {
                if (internalThis.productsReceived) {
                    callback(internalThis.products);
                } else{
                internalThis.productsReceived = true;
                for(var i = 0; i < data.products.length; i++) {
                    internalThis.productsByID[data.products[i].productnumber] = data.products[i]; 
                    internalThis.products.push(data.products[i]); //seems redundant if we already have productsByID containing all products
                    if(internalThis.productsByCategory[data.products[i].category]){
                        internalThis.productsByCategory[data.products[i].category].push(data.products[i]);
                    }else {
                        internalThis.productsByCategory[data.products[i].category] = [];
                        internalThis.productsByCategory[data.products[i].category].push(data.products[i]);
                    }
                }
                callback(internalThis.products);
              }
            })
            .error(function(data, status, headers, config) {
                internalThis.productsReceived = false;
                callback(data);
            });
        }
    }

    this.getProductByID = function(productnumber, callback) {
        $http({method: 'GET', url: "/get_product_by_id/" + productnumber})
            .success(function(data, status, headers, config) {
                callback(data.product);
            })
            .error(function(data, status, headers, config) {
                callback(data);
            });
    }

    this.getProductsByCategory = function(category, callback) {
        if (this.productsReceived) {
            callback(this.productsByCategory[category]);
        } else{
            $http({method: 'POST', url: "/get_products_by_category", data:{category:category}})
            .success(function(data, status, headers, config) {
                callback(data.products);
            })
            .error(function(data, status, headers, config) {
                callback(data);
            });
        }
    }

    this.addItemToCart = function(userid, productnumber, quantity, callback) {
        var internalThis = this;
        internalThis.cartReceived = false;
        $http({method: 'POST', url: "/add_item_to_cart", data: {userid:userid, productnumber:productnumber,quantity:quantity}})
            .success(function(data, status, headers, config) {
                internalThis.cartReceived = true;
                internalThis.cart = data.cart;
                internalThis.updateProductsInCartCookie(internalThis.cart.products);
                callback(data.cart);
            })
            .error(function(data, status, headers, config) {
                internalThis.cartReceived = false;
                callback(data);
            });
    }
    
    this.updateCart = function(userid, productnumbers, quantities, callback) {
        var internalThis = this;
        internalThis.cartReceived = false;
        $http({method: 'POST', url: "/update_cart", data:{userid:userid, productnumbers:productnumbers, quantities:quantities}})
            .success(function(data, status, headers, config) {
                internalThis.cartReceived = true;
                internalThis.cart = data.cart;
                internalThis.updateProductsInCartCookie(internalThis.cart.products);
                callback(data.cart);
            })
            .error(function(data, status, headers, config) {
                internalThis.cartReceived = false;
                callback(data);
            });
    }

    this.emptyCart = function(userid, callback) {
        var internalThis = this;
        internalThis.cartReceived = false;
        $http({method: 'POST', url: "/empty_cart", data:{userid:userid}})
            .success(function(data, status, headers, config) {
                internalThis.cartReceived = true;
                internalThis.cart = data.cart;
                internalThis.updateProductsInCartCookie(internalThis.cart.products);
                callback(data.cart);
            })
            .error(function(data, status, headers, config) {
                internalThis.cartReceived = false;
                callback();
            });
    }

    this.getCartByUserID = function(userid, callback) {
        var internalThis = this;
        $http({method: 'GET', url: "/cart/" + userid})
            .success(function(data, status, headers, config) {
                internalThis.cartReceived = true;
                internalThis.cart = data.cart;
                internalThis.updateProductsInCartCookie(internalThis.cart.products);
                callback(data.cart);
                $rootScope.$broadcast('cartloaded', internalThis.cart);

            })
            .error(function(data, status, headers, config) {
                internalThis.cartReceived = false;
                callback(data);
            });
    }

    this.getOrderByID = function(orderid, callback) {
        if (typeof this.ordersByID[orderid] != 'undefined') {
          callback(this.ordersByID[orderid]);
          return;
        }
        var internalThis = this;
        $http({method: 'GET', url: "/order/" + orderid})
            .success(function(data, status, headers, config) {
                internalThis.ordersByID[orderid] = data.order;
                callback(data.order);
            })
            .error(function(data, status, headers, config) {
                callback(data);
            });
    }

    this.getOrdersByUserID = function(profileid, callback) {
      if (this.ordersReceived) {
        callback(this.orders);
        return;
      }
      var internalThis = this;
      $http({method: 'GET', url: "/all_orders/" + profileid})
        .success(function(data, status, headers, config) {
          if(!data.orders) {
            callback();
            return;
          }
          for (var i = 0; i < data.orders.length; i++) {
            internalThis.ordersByID[data.orders[i].id] = data.orders[i];
          }
          internalThis.orders = data.orders;
          internalThis.ordersReceived = true;
          callback(internalThis.orders);
        })
        .error(function(data, status, headers, config) {
            callback(data);
        });

    }

    this.updateProductsInCartCookie = function(productsInCart) {        
        $cookieStore.put('pInCart', productsInCart || []);
    }

}]);