const User = require('../models/User')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Wishlist = require('../models/Wishlist')
const Order = require('../models/Order')
const Admin = require('../models/Admin')
const { joiUserSchema } = require('../models/Validation')
const Razorpay = require('razorpay')


const regUser = async (req, res) => {
    console.log(req.body);
    const { value, error } = joiUserSchema.validate(req.body)
    console.log("error:", error);
    console.log("value:", value);

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

    const { value, error } = joiUserSchema.validate(req.body)

    const { email, password } = value
    try {
        let user = await User.findOne({ email })
        let role = 'user'

        if (!user) {
            user = await Admin.findOne({ email })
            role = 'admin'
        }

        if (!user) {
            return res.status(404).json('User Not Found')
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: role }, process.env.JWT_KEY, { expiresIn: '1d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: 'none'

        });
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
            return res.json(404).json({ message: "Product not found" })
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
        res.json(getall)
    } catch (error) {
        res.status(500).json(error)
    }
}

const addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const data = await Cart.findOne({ user: req.user.id });

        if (!data) {
            const newCart = new Cart({
                user: req.user.id,
                products: [{ product: productId, quantity }],
            })
            await newCart.save()
            return res.status(200).json(newCart)
        }
        const exist = data.products.find(pro => pro.product.toString() == productId)

        if (exist) {
            exist.quantity += quantity
        } else {
            data.products.push({ product: productId, quantity })
        }

        const newcart = await (await data.save()).populate('products.product')
        res.json(newcart)
    } catch (error) {
        res.status(500).json(error)
        console.log(error);

    }
}

const updateProductQuantity = async (req, res) => {
    try {
        const { productId, action } = req.body;
        const cartdata = await Cart.findOne({ user: req.user.id }).populate('products.product');

        if (!cartdata) {
            return res.status(404).json("User cart not found");
        }

        const cartProduct = cartdata.products.find(prod => prod.product._id.toString() === productId);

        if (!cartProduct) {
            return res.status(404).json("Product not found in cart");
        }

        if (action === "increment") {
            cartProduct.quantity += 1;
        } else if (action === "decrement") {
            if (cartProduct.quantity > 1) {
                cartProduct.quantity -= 1;
            } else {
                cartdata.products = cartdata.products.filter(val => val.product._id.toString() !== productId);
            }
        } else {
            return res.status(400).json("Invalid action for updating quantity");
        }
        await cartdata.save();
        const updatedCart = await Cart.findOne({ user: req.user.id }).populate('products.product');
        res.status(200).json({ products: updatedCart.products || [] });
    } catch (error) {
        res.status(500).json(error);
        console.log(error);
    }
};


const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body
        const datas = await Cart.findOne({ user: req.user.id }).populate('products.product')

        if (!datas) return res.status(404).json("cart not found")
        const productIndex = datas.products.findIndex(pro => pro.product._id.toString() === productId)

        datas.products.splice(productIndex, 1)
        await datas.save()
        res.status(200).json(datas || [])

    } catch (error) {
        res.status(404).json('product not found')
    }
}


const viewCartProducts = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.params.id }).populate('products.product');
        console.log(req.user);

        if (!cart) {
            cart = new Cart({
                user: req.params.id,
                products: []
            });
            await cart.save();
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart products:', error);
        res.status(500).json('Server error');
    }
};


const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const wishlist = await Wishlist.findOne({ user: req.user.id });

        if (!wishlist) {
            const newWish = new Wishlist({
                user: req.user.id,
                products: [productId],
            });
            await newWish.save();
            return res.status(200).json(newWish)
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
            return res.status(200).json(wishlist)
        }

        res.status(200).json("Product already added");

    } catch (error) {
        res.status(500).json({ error: "An error occurred while adding to wishlist." });
    }
};



const removeWishlistProduct = async (req, res) => {
    try {
        const { productId } = req.body
        console.log(productId);

        const datas = await Wishlist.findOne({ user: req.user.id }).populate('products')

        if (!datas) return res.status(404).json("product not found")
        const productIndex = datas.products.find(pro => pro._id === productId)

        datas.products.splice(productIndex, 1)
        await datas.save()
        res.status(200).json(datas || [])

    } catch (error) {
        res.status(404).json('there have an error')
    }
}

const viewWishList = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.params.id }).populate('products');

        if (!wishlist) {
            const newWishlist = new Wishlist({
                user: req.user.id,
                products: [],
            });
            await newWishlist.save();
            return res.status(200).json(newWishlist);
        }

        return res.status(200).json(wishlist);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "An error occurred while viewing the wishlist." });
    }
};



const createOrder = async (req, res) => {
    try {
        const usercart = await Cart.findOne({ user: req.user.id }).populate("products.product")

        if (!usercart || usercart.products.length === 0) {
            return res.status(404).json("Usercart not found or empty");
        }

        const totalprice = Math.round(
            usercart.products.reduce((total, val) => total + val.product.price * val.quantity, 0)
        );


        const razorpayInstance = new Razorpay({
            key_id: process.env.razorpay_key_id,
            key_secret: process.env.razorpay_secret_key,
        });

        const options = {
            amount: totalprice * 100,
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
            payment_capture: 1,
        };

        const razorpayOrder = await razorpayInstance.orders.create(options);

        if (!razorpayOrder) {
            return res.status(500).json("error creating Razorpay order");
        }

        let order = await Order.findOne({ user: req.user.id });

        if (!order) {
            order = new Order({
                user: req.user.id,
                pendingOrders: [],
                completedOrders: [],
            });
        }

        const newOrder = {
            products: usercart.products.map(val => ({
                product: val.product._id,
                quantity: val.quantity,
            })),
            totalprice,
            orderId: razorpayOrder.id,
            paymentStatus: "Pending",
            purchaseDate: Date.now(),
        };


        if (newOrder.paymentStatus === "Pending") {
            const existingPendingIndex = order.pendingOrders.findIndex((ord) => ord.orderId === newOrder.orderId
            );

            if (existingPendingIndex !== -1) {
                order.pendingOrders[existingPendingIndex] = newOrder;
            } else {
                order.pendingOrders.push(newOrder);
            }
        } else {
            const existingCompletedIndex = order.completedOrders.findIndex((ord) => ord.orderId === newOrder.orderId);
            if (existingCompletedIndex !== -1) {
                order.completedOrders[existingCompletedIndex] = newOrder;
            } else {
                order.completedOrders.push(newOrder);
            }
        }

        await order.save();

        await Cart.findOneAndDelete({ user: req.user.id });

        res.status(201).json({
            message: "Order processed successfully",
            order,
            razorpayOrderId: razorpayOrder.id,
            razorpayKeyId: process.env.razorpay_key_id,
        });
    } catch (error) {
        console.error("Error in createOrder:", error);
        res.status(500).json({ message: error.message, error: "Can't create order" });
    }
};




const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId } = req.body;
        const order = await Order.findOne({ "pendingOrders.orderId": razorpayOrderId });

        if (!order) {
            console.error('Order not found with the given Order ID:', razorpayOrderId);
            return res.status(404).json({ message: "Order not found" });
        }

        const pendingOrderIndex = order.pendingOrders.findIndex(
            (ord) => ord.orderId === razorpayOrderId
        );

        if (pendingOrderIndex === -1) {
            console.error('Order not found in pending orders');
            return res.status(404).json("Order not found in pending orders");
        }

        const completedOrder = order.pendingOrders[pendingOrderIndex];
        completedOrder.paymentStatus = "Completed";

        order.pendingOrders.splice(pendingOrderIndex, 1);

        if (!order.completedOrders) {
            order.completedOrders = [];
        }

        order.completedOrders.push(completedOrder);

        await order.save();

        return res.status(200).json("Payment verified");
    } catch (error) {
        console.error("Error in verifyPayment:", error);
        res.status(500).json("Can't verify payment");
    }
};



const cancelPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await Order.findOne({ "pendingOrders.orderId": orderId, user: req.user.id, });

        if (!order) {
            return res.status(404).json("Order not found");
        }

        const pendingIndex = order.pendingOrders.findIndex((ord) => ord.orderId === orderId);

        if (pendingIndex === -1) {
            return res.status(404).json("Pending order not found");
        }

        const pendingOrder = order.pendingOrders[pendingIndex];

        if (pendingOrder.paymentStatus !== "Pending") {
            return res.status(400).json("Cannot cancel completed payment");
        }

        order.pendingOrders.splice(pendingIndex, 1);
        await order.save();

        let userCart = await Cart.findOne({ user: req.user.id });

        if (!userCart) {
            userCart = new Cart({
                user: req.user.id,
                products: pendingOrder.products.map((item) => ({
                    product: item.product,
                    quantity: item.quantity,
                })),
            });
        } else {
            pendingOrder.products.forEach((item) => {
                const existingProductIndex = userCart.products.findIndex(
                    (cartItem) => cartItem.product.toString() === item.product.toString()
                );

                if (existingProductIndex !== -1) {
                    userCart.products[existingProductIndex].quantity += item.quantity;
                } else {
                    userCart.products.push({
                        product: item.product,
                        quantity: item.quantity,
                    });
                }
            });
        }

        await userCart.save();

        return res.status(200).json({ message: "Order cancelled successfully" });
    } catch (error) {
        console.error("Error in cancelPayment:", error);
        res.status(500).json({ message: error.message, error: "Can't cancel order" });
    }
};




const getOrderDetails = async (req, res) => {
    try {
        const orders = await Order.findOne({ user: req.user.id })
            .populate('pendingOrders.products.product')
            .populate('completedOrders.products.product');

        const { pendingOrders, completedOrders } = orders

        if (!orders) return res.status(404).json("no orders for the user")
        res.json({ pendingOrders, completedOrders });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

const userLogout = async (req, res) => {
    try {
        res.clearCookie('token')
        return res.status(200).json('Logged out successfully');
    } catch (error) {
        res.status(500).json(error);
    }
}



module.exports = {
    regUser,
    loginUser,
    userLogout,
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
    getOrderDetails,
    verifyPayment,
    cancelPayment
}