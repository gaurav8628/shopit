const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const fileupload = require('express-fileupload');
const path = require('path');

const errorMiddleware = require('./middlewares/errors');

app.use(express.json());

// middleware to handle errors
app.use(errorMiddleware);
app.use(cookieParser()); 
app.use(fileupload());




// Import all routes

const products = require('./routes/product');
const auth = require('./routes/auth');
const order = require('./routes/order')
const payment = require('./routes/payment')

app.use('/api/v1', products);
app.use('/api/v1', auth);
app.use('/api/v1', order);
app.use('/api/v1', payment);

if(process.env.NODE_ENV === 'PRODUCTION')
{
    app.use(express.static(path.join(__dirname,'../frontend/build')));

    app.get('*',(req,res) => {
        res.sendFile(path.resolve(__dirname,'../frontend/build/index.html'))
    })
}



module.exports = app;