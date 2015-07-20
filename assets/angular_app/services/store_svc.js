trdServices.service("storeService", ['$rootScope', '$http', '$cookieStore', 'stripeService', '$log', 'authService',
    function ($rootScope, $http, $cookieStore, stripeService, $log, authService) {

    this.initService = function() {
        this.productsReceived = false;
        this.cartReceived = false;
        this.ordersReceived = false;
        this.productsInCart = [];
        this.products = [];
        this.productsByID = {};
        this.relatedProductsByID = {};
        this.productsByCategory = {};
        this.productsByMerchant = {};
        this.orders = [];
        this.ordersByID = {};
        this.cart = {};
    }

    this.initService();

    this.getProductMerchant = function(productid, callback) {
        return this.productsByID[productid].attributes.vendor;
    }

    this.getStoreFront = function(callback, refresh) {
        if (this.productsReceived && !refresh) {
            callback(null, this.products);
            return;
        }
        var internalThis = this;
        $http({method: 'POST', url: "/store", data:{ylift: authService.isYLIFT}})
            .success(function(data, status, headers, config) {
                internalThis.products = [];
                internalThis.productsByID = {};
                internalThis.productsByCategory = {};
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
                internalThis.productsReceived = true;
                callback(null, internalThis.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting all products', data);
                internalThis.productsReceived = false;
                callback(data.message);
            });
    }

    this.getProductByID = function(productnumber, callback) {
        if (this.productsByID[productnumber] !== undefined) {
            callback(null, this.productsByID[productnumber]);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: "/get_product_by_id/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.productsByID[productnumber] = data.product;
                callback(null, data.product);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting product by id', data);
                callback(data.message);
            });
    }

    this.getRelatedProducts = function(productnumber, callback) {
        if (this.relatedProductsByID[productnumber] !== undefined) {
            callback(null, this.relatedProductsByID[productnumber]);
            return;
        }
        var inThis = this;
        $http({method: 'GET', url: "/get_related_products/" + productnumber})
            .success(function(data, status, headers, config) {
                inThis.relatedProductsByID[productnumber] = data.products;
                callback(null, data.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting related products', data);
                callback(data.message);
            });
    }

    this.getProductsByCategory = function(category, callback) {
        if (this.productsReceived) {
            callback(null, this.productsByCategory[category]);
        } else{
            var inThis = this;
            $http({method: 'POST', url: "/get_products_by_category", data:{category:category}})
            .success(function(data, status, headers, config) {
                inThis.productsByCategory[category] = data.products;
                callback(null, data.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting products by category', data);
                callback(data.message);
            });
        }
    }

    this.getProductsByMerchant = function(merchantid, callback) {
        if (this.productsByMerchant[merchantid] !== undefined) {
            callback(null ,this.productsByMerchant[merchantid]);
        } else{
            var inThis = this;
            $http({method: 'GET', url: "/get_products_by_merchant/" + merchantid})
            .success(function(data, status, headers, config) {
                inThis.productsByMerchant[merchantid] = data.products;
                callback(null, data.products);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting products by merchant', data);
                callback(data.message);
            });
        }
    }

    this.addItemToCart = function(profileid, productnumber, quantity, callback) {
        if (profileid) {
            var internalThis = this;
            internalThis.cartReceived = false;
            $http({method: 'POST', url: "/add_item_to_cart", data: {profileid:profileid, productnumber:productnumber,quantity:quantity}})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    callback(null, data.cart);
                })
                .error(function(data, status, headers, config) {
                    internalThis.cartReceived = false;
                    $log.debug('there was an error adding item to cart', data);
                    callback(data.message);
                });
        } else {
            var pInCart = $cookieStore.get('pInCart') || [];
            var pInCartObj = {
                "productnumber": productnumber,
                "quantity": quantity
            };
            pInCart.push(pInCartObj);
            this.updateProductsInCartCookie(pInCart);
            callback(null, null);
        }
    }
    
    this.updateCart = function(profileid, productnumbers, quantities, callback) {
        if (profileid) {
            var internalThis = this;
            internalThis.cartReceived = false;
            $http({method: 'POST', url: "/update_cart", data:{profileid:profileid, productnumbers:productnumbers, quantities:quantities}})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    if (callback) {
                        callback(null, data.cart);
                    }
                })
                .error(function(data, status, headers, config) {
                    internalThis.cartReceived = false;
                    $log.debug('there was an error updating cart', data);
                    if (callback) {
                        callback(data.message);
                    }
                });
        } else {
            var pInCart = [];
            productnumbers.forEach(function (num, index) {
                var pInCartObj = {
                    "productnumber": num,
                    "quantity": quantities[index]
                };
                pInCart.push(pInCartObj);
            });
            this.updateProductsInCartCookie(pInCart);
            if (callback) {
                callback(null, null);
            }
        }
    }

    this.emptyCart = function(profileid, callback) {
        if (profileid) {
            var internalThis = this;
            internalThis.cartReceived = false;
            $http({method: 'POST', url: "/empty_cart", data:{profileid:profileid}})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    callback(null, data.cart);
                })
                .error(function(data, status, headers, config) {
                    $log.debug('there was an error emptying the cart', data);
                    internalThis.cartReceived = false;
                    callback(data.message);
                });
        } else {
            this.updateProductsInCartCookie();
            callback(null, null);
        }
    }

    this.getProductsInCart = function(profileid, callback) {
        if (profileid) {
            var internalThis = this;
            $http({method: 'GET', url: "/cart/" + profileid})
                .success(function(data, status, headers, config) {
                    internalThis.cartReceived = true;
                    internalThis.cart = data.cart;
                    internalThis.updateProductsInCartCookie(internalThis.cart.products);
                    callback(null, data.cart.products);
                    $rootScope.$broadcast('cartloaded', internalThis.cart);

                })
                .error(function(data, status, headers, config) {
                    $log.debug('there was an error getting products in user cart', data);
                    internalThis.cartReceived = false;
                    callback(data.message);
                });
        } else {
            callback(null, $cookieStore.get('pInCart') || []);
        }
    }

    this.getOrderByID = function(orderid, callback) {
        if (typeof this.ordersByID[orderid] != 'undefined') {
          callback(null, this.ordersByID[orderid]);
          return;
        }
        var internalThis = this;
        $http({method: 'GET', url: "/order/" + orderid})
            .success(function(data, status, headers, config) {
                internalThis.ordersByID[orderid] = data.order;
                callback(null, data.order);
            })
            .error(function(data, status, headers, config) {
                $log.debug('there was an error getting order by id', data);
                callback(data.message);
            });
    }

    this.getOrdersByUserID = function(profileid, callback) {
      if (this.ordersReceived) {
        callback(null, this.orders);
        return;
      }
      var internalThis = this;
      $http({method: 'GET', url: "/all_orders/" + profileid})
        .success(function(data, status, headers, config) {
          for (var i = 0; i < data.orders.length; i++) {
            internalThis.ordersByID[data.orders[i].id] = data.orders[i];
          }
          internalThis.orders = data.orders;
          internalThis.ordersReceived = true;
          callback(null, internalThis.orders);
        })
        .error(function(data, status, headers, config) {
            $log.debug('there was an error getting orders by user', data);
            callback(data.message);
        });
    }

    this.getMerchantOrders = function(merchantid, callback) {
      var internalThis = this;
      $http({method: 'GET', url: "/merchant_orders/" + merchantid})
        .success(function(data, status, headers, config) {
          for (var i = 0; i < data.orders.length; i++) {
            internalThis.ordersByID[data.orders[i].id] = data.orders[i];
          }
          callback(null, data.orders);
        })
        .error(function(data, status, headers, config) {
            $log.debug('there was an error getting merchant orders', data);
            callback(data.message);
        });
    }

    this.updateOrder = function(order, callback) {
      var internalThis = this;
      $http({method: 'POST', url: "/update_order", data:{order:order}})
        .success(function(data, status, headers, config) {
          internalThis.ordersByID[data.order.id] = data.order;
          if (callback) {
            callback(null, data.order);
          }
        })
        .error(function(data, status, headers, config) {
            $log.debug('there was an error updating the order', data);
            if (callback) {
                callback(data.message);
            }
        });
    }

    this.getFilteredProducts = function(query, callback) {
        var filteredProducts = [];
        this.products.forEach(function(product, index) {
            if(product.name.toLowerCase().indexOf(query) > -1 
                || product.description.toLowerCase().indexOf(query) > -1
                || product.category.toLowerCase() == query){
              filteredProducts.push(product);
            }
        });
        callback(filteredProducts);
    }

    this.updateProductsInCartCookie = function(productsInCart) {        
        $cookieStore.put('pInCart', productsInCart || []);
    }

    this.submitCheckOrder = function(customer, total, callback) {
      var inThis = this;
      $http({method: 'POST', url: "/add_check_order",
            data:{total:total,customer:customer}})
        .success(function(data, status, headers, config) {
            callback(null, {id: data.order.id});
        })
        .error(function(data, status, headers, config) {
          $log.debug('there was an error submitting the check order', data);
          callback(data.message);
        });
      };

    $rootScope.$on('loggedout', function(evt, args) {
        this.initService;
    });

}]);