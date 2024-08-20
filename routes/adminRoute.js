const express = require('express')
const router = express()
const controller = require('../controller/adminControll')
const adminAuth = require('../middleware/adminMiddleware')
const auth = require('../middleware/authMiddleware')


router
    .get('/admin/alluser', auth,adminAuth,controller.viewUsers)
    .get('/admin/alluserById/:id',auth,adminAuth, controller.viewUsersbyID)
    .get('/admin/category/:category',auth,adminAuth, controller.viewProductByCategory)
    .get('/admin/product/:id', auth,adminAuth,controller.viewProductbyID)
    .post('/admin/addproduct',auth,adminAuth, controller.addProducts)
    .delete('/admin/deleteproduct/:id',auth,adminAuth, controller.deleteProduct)

module.exports = router