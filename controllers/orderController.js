import userModel from "../models/userModel.js";
import orderModel from "../models/orderModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";

// global variables
const currency = "thb";
const deliveryCharge = 10;

// gateway initialize
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Placing orders using Stripe Method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Verify Stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// All Orders data for Admin Panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User Order Data For Frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const insertOrders = async (req, res) => {
  try {
    const { id } = req.user;

    const { name, address, paymentMethod, totalPrice, cartItems } = req.body;

    const something = cartItems.map((item) => {
      return { id: item._id, quantity: item.quantity };
    });

    const orderData = {
      userId: id,
      items: something,
      totalPrice,
      address,
      paymentMethod,
      name,
      date: Date.now(),
      status: "order placed",
    };

    // บันทึก product ลง MongoDB
    const order = new orderModel(orderData);
    await order.save();
    console.log(order);
    console.log("order_id :", order._id);
    // console.log(req.user);
    // console.log(req.body);
    res.status(200).json({
      success: true,
      order: order._id,
    });
  } catch (error) {}
};

const getOrders = async (req, res) => {
  try {
    console.log("getOrders");
    const { _id } = req.body;
    console.log("this is _id :", _id);

    // ค้นหา order โดย ID
    const order = await orderModel.findById(_id);

    // เช็คว่ามี order และ items
    if (!order || !order.items) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // ใช้ Promise.all เพื่อ resolve async map
    const orderProduct = await Promise.all(
      order.items.map(async (item) => {
        const product = await productModel.findById(item.id); // เพิ่ม await ที่นี่
        return {
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: item.quantity, // ดึง quantity จาก order.items
        };
      })
    );

    console.log(orderProduct);
    console.log(order);

    // ส่ง response กลับ
    res
      .status(200)
      .json({ success: true, order, orderProduct, userId: order.userId });
  } catch (error) {
    console.error("Error in getOrders:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { id } = req.user; // ดึง user ID จาก token

    // ดึง orders ทั้งหมดของ user
    const orders = await orderModel.find({ userId: id });

    // จัดโครงสร้าง response
    const formattedOrders = await Promise.all(
      orders.map(async (o) => ({
        _id: o._id,
        name: o.name,
        totalPrice: o.totalPrice, // used
        date: o.date,
        status: o.status, // used
        orderProduct: await Promise.all(
          o.items.map(async (item) => {
            const product = await productModel.findById(item.id);
            return {
              name: product.name, // used
              image: product.image, // used
              price: product.price,
              quantity: item.quantity, // used
            };
          })
        ),
      }))
    );

    // ส่ง response
    res.status(200).json({ success: true, orders: formattedOrders });
  } catch (error) {
    console.error("Error in getUserOrders:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export {
  verifyStripe,
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  insertOrders,
  getOrders,
  getUserOrders,
};
