const app = require('./app');
const connectDatabase = require('./config/database');
require('dotenv').config();
const seedProducts = require('./utils/seeder');

const bodyparser = require('body-parser');
const cloudinary = require('cloudinary');


connectDatabase();

// seedProducts();


// setting up cloudinary config
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  


// handling uncaught exceptions 
process.on('uncaughtException',err => {
    console.log(`ERROR: ${err.message}`);
    console.log(`Shutting fown due to uncaught exception`);
    process.exit(1);
})


// handling unhandled promise rejection
process.on('unhandlesRejection',err=>{
    console.log(`ERROR: ${err.message}`);
    console.log(`shutting down the server due to unhandles promise rejection`);
    server.close(()=>{
        process.exit(1);
    })
})

// if(process.env.NODE_ENV !== 'PRODUCTION')
// {

// }


// uncaugh exception example
// console.log(a);


const server = app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT} in ${process.env.NODE_ENV} mode.`);
})




