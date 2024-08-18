const express = require('express')

const controller = require('../controller/userControll')
const auth = require('../middleware/authMiddleware')
const routes = express()

routes
    .post('/user/signup', controller.regUser)
    .post("/user/login", controller.loginUser)
    .get('/user/category/:category', controller.productsCategory)
    .get('/user/:id', controller.productShowById)
    .post('/user/addtocart', auth, controller.addToCart)
    .post('/user/wishlist', auth, controller.addToWishlist)
    .get('/user/viewusercart/:id',auth, controller.viewCartProducts)
    .delete('/user/removefromcart', auth, controller.removeFromCart)
    .get('/user/viewwishlist/:id',auth, controller.viewWishList)
    .delete('/user/removefromwish', auth, controller.removeWishlistProduct)
    .put('/user/updateproquantity', auth, controller.updateProductQuantity)
    .post('/user/create-order',auth,controller.createOrder)
    .get('/user/getorderdetails',auth,controller.getOrderDetails)


module.exports = routes