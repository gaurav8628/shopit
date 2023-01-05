const mongoose = require('mongoose');
require('dotenv').config();

const connectDatabase = () => {

    mongoose.connect(process.env.DB_URI,{
        useNewUrlParser: true,
        // useUnifiesTopology: true,
        // useCreateIndex: true
    })
    .then(con => {
        console.log(`MongoDB Database connected with host : ${con.connection.host}`);
    })
}

module.exports = connectDatabase;