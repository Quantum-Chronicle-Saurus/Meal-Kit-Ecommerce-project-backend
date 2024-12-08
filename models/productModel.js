import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  _id: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  longDescription: { type: String, required: true },
  ingredients: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: Array, required: true },
  category: { type: String, required: true },
  categoryGroup: { type: String, required: true },
  grossWeight: { type: String, required: true },
  nutrition: { type: String, require: true },
  date: { type: Number, required: true },
  ingredients: { type: String, required: false },
});

const productModel =
  mongoose.models.product || mongoose.model("product", productSchema);

export default productModel;
