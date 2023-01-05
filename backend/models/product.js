const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,'please enter product name'],
        trim: true,
        maxLength:[100, 'product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        require: [true, 'please enter product prrice'],
        maxLength: [5, 'product price cannot be more than 10000'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'please enter product description']
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url:{
                type: String,
                required: true
            }
        }
    ],
    seller: {
        type: String,
        required:[true, 'please enter product seller']
    },
    stock: {
        type: Number,
        required: [true, 'please enter the stock'],
        maxLength: [5, 'stock cannot exceed 10000']
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name:{
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: 
            {
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required: [true, 'please select category for the product'],
        enum: {
            values:[
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message:'Please Select Correct category for product'
        },
        
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
      
        createdAt: {
            type: Date,
            default: Date.now
        }

    }
})

module.exports = mongoose.model('Products', productSchema);