const express = require('express')
const router = express()
const controller = require('../controller/adminControll')
const adminAuth = require('../middleware/adminMiddleware')
const auth = require('../middleware/authMiddleware')


router
    .get('/admin/alluser', auth,adminAuth,controller.viewUsers)
    .get('/admin/alluserById/:id',auth,adminAuth, controller.viewUsersbyID)
    .get('/admin/allproducts',auth,adminAuth,controller.getAllProducts)
    .get('/admin/category/:category',auth,adminAuth, controller.viewProductByCategory)
    .get('/admin/product/:id', auth,adminAuth,controller.viewProductbyID)
    .post('/admin/addproduct',auth,adminAuth, controller.addProducts)
    .delete('/admin/deleteproduct/:id',auth,adminAuth, controller.deleteProduct)
    .put('/admin/updateproduct/:id' ,auth,adminAuth,controller.updateProduct)
    .get('/admin/allproduct-ordered',auth,adminAuth,controller.getTotalProductsOrdered)
    .get('/admin/total-revenue',auth,adminAuth,controller.getTotalRevenue)
    .get('/admin/allorders',auth,adminAuth,controller.getAllOrderDetails)
    .get('/admin/getorderbyuser/:id',auth,adminAuth,controller.getOrderByUserId)
    .delete('/admin/deleteuser/:id',auth,adminAuth,controller.deleteUser)

module.exports = router