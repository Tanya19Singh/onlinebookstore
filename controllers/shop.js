// const Order = require('../models/order');
const Product=require('../models/product');//importing the class
const Order=require('../models/order');

exports.getproducts=(req,res,next)=>{
     Product.find()//gives all products automatically
     .then((products)=>{
        res.render('shop/productlist',{
            prods:products,
            doctitle:'all products',
            path:'/products',
            isAuthenticated:req.session.isLoggedIn
        })

    }).catch(err => console.log(err));

}
exports.getproduct=(req,res,next)=>{
    const prodId=req.params.productId;
    Product.findById(prodId)//here findById is method provided by mongoose
    .then(product=>{//receiving product array(although of only 1 product) through sql querry
        res.render('shop/product-detail',{product:product,doctitle:product.title,path:'/products', isAuthenticated:req.session.isLoggedIn})    
    })
    .catch(err=>console.log(err));
}
exports.getindex=(req,res,next)=>{
    //-------callback approach when file was used to store the data-----
    //  Product.fetchAll(products=>{
    // res.render('shop/index',{prods:products,doctitle: 'shop',path:'/',hasproducts: products.length>0, activeshop:true, productsCSS:true});
    // });
    // -----------sql method---------
    // Product.fetchAll()
    // .then(([rows,fielddata])=>{
    //     res.render('shop/index',{
    //         prods:rows,
    //         doctitle:'shop',
    //         path:'/'
    //     })

    // }).catch(err => console.log(err));
console.log(req.session.isLoggedIn);
    Product.find().then(products=>{
        res.render('shop/index',{
            prods:products,
            doctitle:'shop',
            path:'/',
            
        })
    }).catch(err=>{console.log(err);});
}

exports.postorder=(req,res,next)=>{

    req.user
        .populate('cart.items.productId')
        .then(user=>{
            const products=user.cart.items.map(i=>{
                return {quantity: i.quantity, productData:{...i.productId._doc}};//.doc accesses all the metadata stored with productId 
            });
            const order=new Order({
                user:{
                    email:req.user.email,
                    userId: req.user
                },
                products: products
            });
           return order.save();
        })
        .then(result=>{
            return req.user.clearCart();
        })
        .then(result=>{
            res.redirect('/orders');

        })
        .catch(err=>console.log(err))
    // .then(cart=>{
    //     fetchedCart=cart;
    //     return cart.getProducts();
    // })
    // .then(products=>{
    // return req.user
    //     .createOrder()
    //     .then(order=>{
    //     return order.addProducts(products.map(product=>{
    //     product.orderItem={quantity: product.cartItem.quantity};
    //     return product;
    //     }))})
    //     .catch(err=>{
    //     console.log(err)});
    // })
    // .then(result=>{
    //     return fetchedCart.setProducts(null);
    // })
}

exports.getOrders=(req,res,next)=>{
    Order.find({"user.userId": req.user._id})
        .then(orders=>{
            res.render('shop/orders',{
                doctitle: 'your orders',
                path:'/orders',
                 activeshop:true, 
                 productsCSS:true,
                orders:orders,
                isAuthenticated:req.session.isLoggedIn});

        })
        .catch(err=>{
            console.log(err);
        })
}
exports.getcart=(req,res,next)=>{
    // Cart.getcart(cart=>{
    //     Product.fetchAll(products =>{
    //         const cartproducts=[];
    //         for(product of products)
    //         {
    //             const cartproductdata=cart.products.find(prod=> prod.id===product.id);
    //             if(cartproductdata)
    //             {
    //                 cartproducts.push({productdata:product, qty:cartproductdata.qty});
    //             }
    //         }
    //         res.render('shop/cart',{
    //             path:'/cart',
    //             doctitle:'your cart',
    //             products: cartproducts
    //         })
    //     })
    // })
    req.user.populate('cart.items.productId')
    // .execPopulate()//populate does not return a promiseb
    .then(user=>{
        console.log(user);
        const products=user.cart.items;
            res.render('shop/cart',{
                path: '/cart',
                doctitle: 'your cart',
                products: products
            
            });
        
    })
    .catch(err=>console.log(err));
}

exports.postcart=(req,res,next)=>{
    const prodId=req.body.productId;
    let fetchedCart;
    let newQuantity=1;

    Product.findById(prodId).then(product=>{
        console.log(product);
        return req.user.addToCart(product);
    })
    .then(result=>{
        res.redirect('/cart');

    })
    .catch(err=>{
        console.log(err);
    });
    // req.user.getCart()
    // .then(cart=>{
    //     fetchedCart=cart;
    //     return cart.getProducts({where:{id:prodId}});
    // })
    // .then(products=>{
    //     let product;
    //     if(products.length>0)
    //     {
    //         product=products[0];
    //     }
    //     if(product){
    //         const oldQuantity= product.cartItem.quantity;
    //         newQuantity=oldQuantity+1;
    //         return product;
    //     }

    //     return Product.findByPk(prodId);
    // })
    //     .then(product=>{
    //         return fetchedCart.addProduct(product,{
    //             through: {quantity: newQuantity}
    //         });
    // })
    // .then(()=>{
    //     res.redirect('/cart');
    // })
    // .catch(err=>console.log(err));
}

exports.postcartdeleteproduct=(req,res,next)=>{
    const prodId=req.body.productId;
    req.user.removeFromCart(prodId)
    .then(result=>{
        res.redirect('/cart');
    })
    .catch(err=>{
        console.log(err);
    })
    
   
}
exports.getcheckout=(req,res,next)=>{
    res.render('shop/checkout',{doctitle: 'your checkout',path:'/checkout', isAuthenticated:req.session.isLoggedIn});
    
    // res.sendFile(path.join(rootdir,'views','shop.html'));
}

