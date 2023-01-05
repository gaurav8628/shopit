const Product = require('../models/product');
require('dotenv').config();
const products = require('../data/product.json');
// const {connect} = require('mongoose');
// const connectDatabase = require('../config/database');


const seedProducts = async () => {
    try{
        await Product.deleteMany();
        console.log('products are deleted');
        await Product.insertMany(products);
    }
    catch(err)
    {
        console.log(err.message);
        process.exit();
    }
}

module.exports = seedProducts;