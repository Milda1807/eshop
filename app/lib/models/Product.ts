import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IProduct extends Document {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    imageUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Název produktu je povinný.'],
        trim: true,
        maxlength: [100, 'Název produktu nemůže být delší než 100 znaků.']
    },
    description: {
        type: String,
        required: [true, 'Popis produktu je povinný.'],
    },
    price: {
        type: Number,
        required: [true, 'Cena produktu je povinná.'],
        min: [0, 'Cena nemůže být záporná.']
    },
    category: {
        type: String,
        required: [true, 'Kategorie je povinná.'],
        trim: true,
    },
    stock: {
        type: Number,
        required: [true, 'Počet kusů na skladě je povinný.'],
        min: [0, 'Skladové množství nemůže být záporné.'],
        default: 0,
    },
    imageUrl: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

ProductSchema.pre<IProduct>('save', function(next) {
    this.updatedAt = new Date();
    next();
});

ProductSchema.pre<mongoose.Query<IProduct, IProduct>>('findOneAndUpdate', function(next) {
    this.set({ updatedAt: new Date() });
    next();
});


const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;