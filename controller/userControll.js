const User = require('../models/User')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Wishlist = require('../models/Wishlist')
const Order = require('../models/Order')
const Admin = require('../models/Admin')
const { joiUserSchema } = require('../models/Validation')


const regUser = async (req, res) => {
    console.log(req.body);
    const { value, error } = joiUserSchema.validate(req.body)
    console.log("error:",error);
    console.log("value:",value);
    
    
    if (error) {
        console.log("error");
        
        return res.status(400).json({
          status: "Error",
          message: "Invalid user input data ",
        });
      }
    const { name, email, password } = value
    try {
        const newuser = new User({ name, email, password })
        await newuser.save()
        res.status(201).json({ status: "success", message: "user registerd", data: newuser })
    } catch (error) {
        res.status(404).json(error)
    }
}

const loginUser = async (req, res) => {

    const {value,error} = joiUserSchema.validate(req.body)
    if (error) {
        return res.status(400).json({ message: 'Validation error', details: error.details });
      }
    const { email, password } = value
    try {
        let user = await User.findOne({ email })
        let role = 'user'

        if (!user) {
            user = await Admin.findOne({email })
            role = 'admin'
        }
        
        if (!user) {
            return res.status(404).json('User Not Found')
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: role }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email, role: role } });
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


const getAllProducts = async (req, res) => {
    try {
        const getall = await Product.find()
        if (!getall) {
            res.json(404).json('not found')
        }
    } catch (error) {
        res.status(500).json(error)
    }
}

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, price } = req.body;
        const data = await Cart.findOne({ user: req.user.id });

        if (!data) {
            const newCart = new Cart({
                user: req.user.id,
                products: [{ product: productId, quantity, price }],
            })
            await newCart.save()
            return res.status(200).json(newCart)
        }
        const exist = data.products.find(pro => pro.product.toString() == productId)

        if (exist) {
            exist.quantity += quantity
        } else {
            data.products.push({ product: productId, quantity, price })
        }

        await data.save()
        res.json(data)
    } catch (error) {
        res.status(500).json(error)
    }
}

const updateProductQuantity = async (req, res) => {
    try {
        const { productId, action } = req.body
        const cartdata = await Cart.findOne({ user: req.user.id })
        console.log(cartdata);

        if (!cartdata) {
            res.status(404).json("user cart not found")
        }
        const cartProduct = cartdata.products.find(prod => prod.product.toString() === productId)

        if (action === "increment") {
            cartProduct.quantity += 1
        } else if (action === "decrement") {
            if (cartProduct.quantity > 1) {
                cartProduct.quantity -= 1
            } else {
                cartdata.products = cartdata.products.filter(val => val.product.toString() !== productId)
            }
        } else {
            res.status(404).json("there is an issue for updating quantity")
        }
        await cartdata.save();
        res.status(200).json(cartdata);
    } catch (error) {
        res.status(500).json(error)
    }
}

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body
        const datas = await Cart.findOne({ user: req.user.id })

        if (!datas) return res.status(404).json("cart not found")
        const productIndex = datas.products.findIndex(pro => pro.product.toString() === productId)

        datas.products.splice(productIndex, 1)
        await datas.save()
        res.status(200).json('product removed')

    } catch (error) {
        res.status(404).json('product not found')
    }
}


const viewCartProducts = async (req, res) => {
    try {
        const cartproduct = await Cart.findOne({ user: req.user.id })
        if (!cartproduct) {
            res.json(404).json('not found')
        }
        res.status(200).json(cartproduct)
    } catch (error) {
        console.log(error);

    }
}


const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body
        const wishlist = await Wishlist.findOne({ user: req.user.id })
        if (!wishlist) {
            const newWish = new Wishlist({
                user: req.user.id,
                products: [productId]
            })
            await newWish.save()
            res.status(200).json(newWish)
        }
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId)
            await wishlist.save()
            return res.status(200).json({ message: "product added to wishlist" })
        } else {
            res.json("product already added")
        }
        res.json(wishlist)
    } catch (error) {
        res.status(404).json(error)
    }
}


const removeWishlistProduct = async (req, res) => {
    try {
        const { productId } = req.body
        const datas = await Wishlist.findOne({ user: req.user.id })

        if (!datas) return res.status(404).json("product not found")
        const productIndex = datas.products.findIndex(pro => pro.toString() === productId)

        datas.products.splice(productIndex, 1)
        await datas.save()
        res.status(200).json('product removed')

    } catch (error) {
        res.status(404).json('there have an error')
    }
}

const viewWishList = async (req, res) => {
    try {
        const wishlistproduct = await Wishlist.findOne({ user: req.params.id })
        if (!wishlistproduct) {
            res.json(404).json('not found')
        }
        res.status(200).json(wishlistproduct)
    } catch (error) {
        console.log(error);

    }

}


const createOrder = async (req, res) => {
    try {
        const usercart = await Cart.findOne({ user: req.user.id })
        console.log(usercart.products);

        if (!usercart) return res.status(404).json("Usercart not found")

        const totalprice = usercart.products.reduce((total, val) => total + val.price * val.quantity, 0)
        console.log(totalprice);

        const order = new Order({
            user: req.user.id,
            products: usercart.products.map(val => ({
                product: val.product._id,
                quantity: val.quantity,
            })),
            totalprice,
        })

        await order.save()
        await Cart.findOneAndDelete({ user: req.user.id })
        res.status(200).json(order)
    } catch (error) {
        res.status(500).json(error)
    }
}

const getOrderDetails = async (req, res) => {
    try {
        const orders = await Order.findOne({ user: req.user.id }).populate('products.product');
        if (!orders) return res.status(404).json("user not found")
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}




module.exports = {
    regUser,
    loginUser,
    ////////////////////////
    productShowById,
    productsCategory,
    getAllProducts,
    ////////////////////////
    viewCartProducts,
    removeFromCart,
    addToCart,
    updateProductQuantity,
    ////////////////////////
    addToWishlist,
    viewWishList,
    removeWishlistProduct,
    ////////////////////////
    createOrder,
    getOrderDetails
}