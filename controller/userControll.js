const User = require('../models/User')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Wishlist = require('../models/Wishlist')


const regUser = async (req, res) => {
    console.log(req.body);
    
    const { name, email, password } = req.body
    try {
        const newuser = new User({ name, email, password })
        await newuser.save()
        res.status(201).json({status:"success",message:"user registerd",data:newuser})
    } catch (error) {
        res.status(404).json(error)
    }
}

const loginUser = async (req, res) => {
    const { email, password } = req.body

    console.log(req.body);
    
    try {
        const user = await User.findOne({email})
        console.log(user);
        
        if (!user) {
            return res.status(404).json({ message: 'User Not Found' })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
    } catch (error) {
        res.status(404).json(error)
    }
}

const productsCategory = async (req, res) => {
    try {
        const products = await Product.find({ category: req.params.category });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error });
    }
}

const productShowById = async (req, res) => {
    try {
        const cateProduct = await Product.findById(req.params.id)
        if (!cateProduct) {
            res.json(404).json({ message: "Product not found" })
        }
        res.json(cateProduct)

    } catch (error) {
        res.status(500).json(error)
    }
}

const addToCart = async (req,res) => {
    try {
        const { productId, quantity } = req.body;
        const data = await Cart.findOne({ user: req.user });
        if (!data) {
            const newCart = new Cart ({
                user:req.user,
                products:[{product:productId,quantity}],
            })
            await newCart.save()
            return res.status(200).json(newCart)
        }
        const exist = data.products.find(pro=>pro.product.toString()==productId)
        
        if(exist){
            exist.quantity+=quantity
        }else{
            data.products.push({product:productId,quantity})
        }

        await data.save()
        res.json(data)
    } catch (error) {
        res.status(500).json(error)
    }
}


const addToWishlist =async(req,res)=>{
   try {
    const {productId} = req.body
    const wishlist = await Wishlist.findOne({user:req.user})
    if(!wishlist){
        const newWish = new Wishlist({
            user:req.user,
            products:[productId]
        })
        await newWish.save() 
        res.status(200).json(newWish)
    }
    if(!wishlist.products.includes(productId)){
        wishlist.products.push(productId)
        await wishlist.save()
        return res.status(200).json({message:"product added to wishlist"})
    }
    res.json(wishlist)
   } catch (error) {
     res.status(404).json(error)
   }
}





module.exports={
  regUser,
  loginUser,
  productShowById,
  productsCategory,
  addToCart,
  addToWishlist
}