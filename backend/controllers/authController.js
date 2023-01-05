const User = require('../models/user');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const cloudinary = require('cloudinary')


// Register => /api/v1/register
exports.registerUser = catchAsyncErrors(async (req,res,next) => {

    const result  = await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder: 'avatars',
        width:150,
        crop: 'scale'
    });

    const {name,email,password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            public_id: result.public_id,
            url: result.secure_url
        }
    })

    const token = user.getJwtToken();
    // res.status(201).json({
    //     success: true,
    //     token
    // })
    sendToken(user,200,res);
})


// Login User => /api/v1/login

exports.loginUser =catchAsyncErrors (async (req,res,next) => {

    // check if the email and password is entered by user
    const {email,password} = req.body;

    if(!email || !password)
    {
        return next(new ErrorHandler('please enetr email and password'));
    }

    // finding user in database
    const user = await User.findOne({email}).select('+password')

    if(!user)
    {
        return next(new ErrorHandler('Invalid Email or Password',401));
    }
    // checks if password is correct

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect)
    {
        return next(new ErrorHandler('Invalid Email or Password',401))
    }

    const token = user.getJwtToken();

    // we will be sending the jwt in a coikie because the 
    // cannot be accesed in the from using any javascript code

    // res.status(200).json({
    //     success: true,
    //     token
    // })
    sendToken(user,200,res);

})


exports.logout = catchAsyncErrors(async (req,res,next) => {
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})

// Forgot password
exports.forgotPassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findOne({email:req.body.email});

    if(!user)
    {
        return next(new ErrorHandler('User not found with this email',404));
    }
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({validateBeforeSave:false});
    // create reset password url

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
    // const resetUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`
    const message = `your password reset token is as follows:\n\n${resetUrl}\n\nIf you have not requested this email then   ignore it`;
    try{
        await sendEmail({
            email: user.email,
            subject: 'ShopIt password recovery',
            message
        })
        res.status(200).json({
            success: true,
            message: `Email Sent to: ${user.email}`
        })

    }
    catch(error)
    {
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHandler(error.message,500));
    }
})


// Reset Password => /api/v1/password/reset/:token
exports.resetPassword = catchAsyncErrors(async (req,res,next) => {

    // Hash URL token
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt:Date.now()}
    })

    if(!user) {
        return next(new ErrorHandler('password reset token is invalid or has been expired',400));

    }

    if(req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler('Password does not match',400));
    }

    // setup
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    // user has changed his password so we have to send the jwt token again
    sendToken(user,200,res);
})



// User routes

// Get Currently logged in user => /api/v1/me

exports.getUserProfile = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })

})

// update/change password => /api/v1/password/update
exports.updatePassword = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findById(req.user.id).select('+password');
    const isMatched  = await user.comparePassword(req.body.oldPassword);
    if(!isMatched)
    {
        return next(new ErrorHandler('old password is incorrect',400));
    }

    user.password = req.body.password;
    await user.save();
    sendToken(user,200,res);
    // res.status(200).json({
    //     success: true,
    //     message: 'Password updated successfully'
    // })
})


// update user profile => /api/v1/me/update

exports.updateProfile  = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    // update avatar:TODO

    if(req.body.avatar !== ''){
        const user = await User.findById(req.user.id);

        const image_id = user.avatar.public_id;
        const res = await cloudinary.v2.uploader.destroy(image_id);
        const result  = await cloudinary.v2.uploader.upload(req.body.avatar,{
            folder: 'avatars',
            width:150,
            crop: 'scale'
        });
        newUserData.avatar = {
            public_id: result.public_id,
            url: result.secure_url
        }

    }


    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
    })
})



// Admin Routes

// Get all users => /api/v1/admin/users

exports.allUsers = catchAsyncErrors(async(req,res,next) => {
    const users = await User.find();
    res.status(200).json({
        success: true,
        users
    })
})


// Get Users details by id => /api/v1/admin/user/:id

exports.getUserDetails = catchAsyncErrors(async (req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user)
    {
        return next(new ErrorHandler(`user doesnot exist with id :${req.params.id}`,400));
    }

    res.status(200).json({
        success: true,
        user
    })
})



// admin - update user profile => /api/v1/admin/user/:id

exports.updateUserProfile  = catchAsyncErrors(async(req,res,next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    // update avatar:TODO

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new:true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
    })
})

// admin-delete a user  => /api/v1/admin/user/:id

exports.deleteUser = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorHandler(`User is not found with id: ${req.params.id}`,400));
    }

    // Remove avatar from cloudinary: TODO

    await user.remove();

    res.status(200).json({
        success: true
    })
})


