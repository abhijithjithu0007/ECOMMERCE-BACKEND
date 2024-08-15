const express = require('express')
const router = express()
const controller = require('../controller/adminControll')


router
    .get('/admin/alluser', controller.viewUsers)
    .get('/admin/alluserById/:id', controller.viewUsersbyID)
    .get('/admin/category/:category', controller.viewProductByCategory)
    .get('/admin/product/:id', controller.viewProductbyID)
    .post('/admin/addproduct', controller.addProducts)
    .delete('/admin/deleteproduct/:id', controller.deleteProduct)

module.exports = router