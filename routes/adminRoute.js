const express = require('express')
const router = express()
const controller = require('../controller/adminControll')
const adminAuth = require('../middleware/adminMiddleware')
const auth = require('../middleware/authMiddleware')


router
    .get('/admin/alluser', adminAuth,auth,controller.viewUsers)
    .get('/admin/alluserById/:id',adminAuth,auth, controller.viewUsersbyID)
    .get('/admin/category/:category',adminAuth,auth, controller.viewProductByCategory)
    .get('/admin/product/:id', adminAuth,auth,controller.viewProductbyID)
    .post('/admin/addproduct',adminAuth,auth, controller.addProducts)
    .delete('/admin/deleteproduct/:id',adminAuth,auth, controller.deleteProduct)

module.exports = router