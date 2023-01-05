const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors  =require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures'); 



// create new product => /api/v1/product/new

exports.newProduct = catchAsyncErrors(async(req,res,next) => {
    req.body.user = req.user.id;
    // console.log(req.body);
    const product = await Product.create(req.body);
    product.save();
    res.status(201).send({
        success: true,
        product
    })
})


// get all products => /api/v1/products?keyword=apple

exports.getProducts =catchAsyncErrors(async (req,res,next) => {

    // return next(new ErrorHandler('My Error', 4000));

    const resPerPage =4;
    const productCount = await Product.countDocuments();
    const apiFeatures = new APIFeatures(Product.find(),req.query)
                            .search()
                            .filter()
                            .pagination(resPerPage);
    // const products = await Product.find();
    const products = await apiFeatures.query;
    // setTimeout(() => {
    //     res.status(200).json({
    //         success: true,
    //         count: products.length,
    //         productCount,
    //         products
    //     })
    // },2000) 
    res.status(200).json({
        success: true,
        count: products.length,
        productCount,
        resPerPage,
        products
    })
})


exports.getAdminProducts =catchAsyncErrors(async (req,res,next) => {

    const products = await Product.find();
    
    res.status(200).json({
        success: true,
        products
    })
})

// Get single product => /api/v1/product/:id

exports.getSingleProduct = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.params.id);
    if(!product)
    {
        // res.status(404).json({
        //     success: false,
        //     message: 'product not found'
        // })
        return next(new ErrorHandler('Product Not Found',404));
    }
    res.status(200).json({
        success: true,
        product
    })
})


// update the product => /api/v1/product/:id

exports.updateProduct = catchAsyncErrors(async (req,res,next) => {
    let product = Product.findById(req.params.id);
    if(!product)
    {
        res.status(404).json({
            success: false,
            message: 'product not found'
        })
    }
    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        product
    })

})

// Delete Product => /api/v1/admin/product/:id

exports.deleteProduct = catchAsyncErrors(async (req,res,next) => {
    const product = await Product.findById(req.params.id);
    if(!product)
    {
        res.status(404).json({
            success: false,
            message: 'product not found'
        })
    }

    await product.remove();

    res.status(200).json({
        success: true,
        message: "Product is deleted"
    })
})



// Create new review   =>   /api/v1/review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {

    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);

    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    // const isReviewed=false;
    // console.log(product.reviews);

    if (isReviewed) {
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()) {
                review.comment = comment;
                review.rating = rating;
            }
        })

    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })

})


// Get Product Reviews   =>   /api/v1/reviews
exports.getProductReviews = catchAsyncErrors(async (req, res, next) => {
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete Product Review   =>   /api/v1/reviews
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    console.log(product);

    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReviews
    }, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})