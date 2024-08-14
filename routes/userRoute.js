const express = require('express')

const controller = require('../controller/userControll')
const auth = require('../middleware/authMiddleware')
const routes = express()

routes
 .post('/user/signup',controller.regUser)
 .post("/user/login",controller.loginUser)
 .post ('/user/addtocart',auth,controller.addToCart)
 .get('/user/category/:category',controller.productsCategory)
 .get('/user/:id',controller.productShowById)
.post('/user/wishlist',auth,controller.addToWishlist)


module.exports= routes