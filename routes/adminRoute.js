const express = require('express')
const { viewUsers,viewUsersbyID } = require('../controller/adminControll')
const router = express()
const controller = require('../controller/adminControll')


router
   .get('/admin/alluser',controller.viewUsers)
   .get('/admin/alluserById/:id',controller.viewUsersbyID)
   .get('/admin/category/:category',controller.viewProductByCate)
   .get('/admin/category/:id',controller.viewProductbyID)


   module.exports=router