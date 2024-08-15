const User = require('../models/User')
const Product  = require('../models/Product')
const Cart = require('../models/Cart')
const { contextsKey } = require('express-validator/lib/base')




const viewUsers = async(req,res)=>{
   try {
    const user = await User.find()
    res.status(200).json(user)
   } catch (error) {
    res.status(404).json(error)
   }
}


const viewUsersbyID = async(req,res)=>{
   try {
    const userid = await User.findById(req.params.id)
    if(!userid){
        return res.status(404).json("user not found")
    }
    res.status(200).json(userid)
   } catch (error) {
    res.status(500).json(error)
   }
}


const viewProductByCategory = async(req,res)=>{
   try {
    const category = await Product.find({category:req.params.category})
    res.status(200).json(category)
   } catch (error) {
    res.status(500).json(error)
   }
}

const viewProductbyID=async(req,res)=>{
  try {
    const productid= await Product.findById(req.params.id)    
    if(!productid){
        return res.status(404).json("product not found")
    }
    res.status(200).json(productid)
  } catch (error) {
    res.status(500).json(error)

  }
}


const addProducts = async(req,res)=>{
   try {
    const {name,description,price,category,image} = req.body
    const newproduct = new Product({name,description,price,category,image})
    await newproduct.save()
    res.status(200).json(newproduct)
    
   } catch (error) {
    res.status(500).json(error)
   }
}


const deleteProduct =async(req,res)=>{
   try {
    const Proid = await Product.findByIdAndDelete(req.params.id)
    if (!Proid) return res.status(404) 
    res.json("Product deleted successfully" );
} catch (error) {
    res.status(500).json(error)
   }
}





module.exports={
    viewUsers,
    viewUsersbyID,
    viewProductByCategory,
    viewProductbyID,
    addProducts,
    deleteProduct
}