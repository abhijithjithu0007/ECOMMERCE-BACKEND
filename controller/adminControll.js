const User = require('../models/User')
const Product = require('../models/Product')
const Cart = require('../models/Cart')
const Order = require('../models/Order')
const Wishlist = require('../models/Wishlist')
const { joiProductSchema } = require('../models/Validation')



const viewUsers = async (req, res) => {
   try {
      const user = await User.find()
      res.status(200).json(user)
   } catch (error) {
      res.status(404).json(error)
   }
}

const deleteUser = async (req, res) => {
   try {
      const deleteduser = await User.findByIdAndDelete(req.params.id)
      if (!deleteduser) return res.status(404)
      res.status(200).json(deleteduser);
   } catch (error) {
      res.status(500).json(error)
   }
}

const viewUsersbyID = async (req, res) => {
   try {
      const userid = await User.findById(req.params.id)
      if (!userid) {
         return res.status(404).json("user not found")
      }
      res.status(200).json(userid)
   } catch (error) {
      res.status(500).json(error)
   }
}

const getAllProducts = async (req, res) => {
   try {
      const getall = await Product.find()
      if (!getall) {
         res.status(404).json('not found')
      }
      res.status(200).json(getall)
   } catch (error) {
      res.status(500).json(error)
   }
}

const viewProductByCategory = async (req, res) => {
   try {
      const category = await Product.find({ category: req.params.category })
      res.status(200).json(category)
   } catch (error) {
      res.status(500).json(error)
   }
}

const viewProductbyID = async (req, res) => {
   try {
      const productid = await Product.findById(req.params.id)
      if (!productid) {
         return res.status(404).json("product not found")
      }
      res.status(200).json(productid)
   } catch (error) {
      res.status(500).json(error)

   }
}


const addProducts = async (req, res) => {

   const { value, error } = joiProductSchema.validate(req.body)
   if (error) {
      return res.status(400).json(error)
   }
   try {
      const { name, description, price, category, image } = value
      const newproduct = new Product({ name, description, price, category, image })
      await newproduct.save()
      res.status(200).json(newproduct)

   } catch (error) {
      res.status(500).json(error)
   }
}


const deleteProduct = async (req, res) => {
   try {
      const deletedProduct = await Product.findByIdAndDelete(req.params.id);
      if (!deletedProduct) {
         return res.status(404).json({ message: "Product not found" });
      }

      await Cart.updateMany(
         { "products.product": req.params.id },
         { $pull: { products: { product: req.params.id } } }
      );

      await Wishlist.updateMany(
         { "products.product": req.params.id },
         { $pull: { products: { product: req.params.id } } }
      );

      res.status(200).json("Product deleted successfully and removed from all carts and wishlists");
   } catch (error) {
      res.status(500).json({ message: "Error deleting product", error });
   }
};



const updateProduct = async (req, res) => {
   const { value, error } = joiProductSchema.validate(req.body);

   if (error) {
      return res.status(400).json(error)
   }
   try {
      const updatedProduct = await Product.findByIdAndUpdate(req.params.id, value, { new: true });

      if (!updatedProduct) {
         return res.status(404).json('Product not found');
      }
      res.json(updatedProduct);
   } catch (error) {
      res.status(500).json('Server error', error);
   }
};


const getTotalProductsOrdered = async (req, res) => {
   try {
      const total = await Order.findOne({ user: req.user.id }).populate('pendingOrders.products.product').populate('completedOrders.products.product');
      const { pendingOrders, completedOrders } = total
      res.status(200).json({pendingOrders,completedOrders})
   } catch (error) {
      res.status(500).json(error)
   }
}

const getTotalRevenue = async (req, res) => {
   try {
      const revenue = await Order.aggregate([
         { $unwind: "$products" },
         { $group: { _id: null, totalRevenue: { $sum: '$totalprice' } } }
      ])
      res.json(revenue)
   } catch (error) {
      res.status(500).json(error)
   }
}


const getAllOrderDetails = async (req, res) => {
   try {
      const details = await Order.find()
      res.status(200).json(details)
   } catch (error) {
      res.status(500).json(error)
   }
}

const getOrderByUserId = async (req, res) => {
   try {
      const details = await Order.findById(req.params.id)
      if (!details) return res.status(404).json("cannot found")
      res.status(200).json(details)
   } catch (error) {
      res.status(500).json(error)
   }
}


module.exports = {
   viewUsers,
   viewUsersbyID,
   viewProductByCategory,
   viewProductbyID,
   addProducts,
   deleteProduct,
   updateProduct,
   getAllProducts,
   getTotalProductsOrdered,
   getTotalRevenue,
   getAllOrderDetails,
   getOrderByUserId,
   deleteUser
}