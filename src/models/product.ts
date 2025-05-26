import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ProductAttrs {
  title: string;
  price: number;
  userId: string;
  images: {
    image1: string;
    image2?: string;
    image3?: string;
    image4?: string;
  };
  colors: string[];
  sizes: string[];
  category: string;
  description: string;
  countInStock: number;
}

interface ProductDoc extends mongoose.Document {
  title: string;
  price: number;
  userId: string;
  images: {
    image1: string;
    image2?: string;
    image3?: string;
    image4?: string;
  };
  colors: string[];
  sizes: string[];
  category: string;
  description: string;
  countInStock: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface ProductModel extends mongoose.Model<ProductDoc> {
  build(attrs: ProductAttrs): ProductDoc;
}

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    userId: { type: String, required: true },
    images: {
      image1: { type: String, required: true },
      image2: { type: String },
      image3: { type: String },
      image4: { type: String }
    },
    colors: [{ type: String }],
    sizes: [{ type: String }],
    category: { type: String, required: true },
    description: { type: String, required: true },
    countInStock: { type: Number, required: true, default: 1 },
    isReserved: { type: Boolean, default: false }
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      }
    },
    timestamps: true
  }
);

productSchema.set('versionKey', 'version');
productSchema.plugin(updateIfCurrentPlugin);

productSchema.statics.build = (attrs: ProductAttrs) => {
  return new Product(attrs);
};

const Product = mongoose.model<ProductDoc, ProductModel>('Product', productSchema);

export { Product };