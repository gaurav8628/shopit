const express = require('express');
const router = express.Router();

const {loginUser, 
    registerUser,
    logout,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updatePassword,
    updateProfile,
    allUsers,
    getUserDetails,
    updateUserProfile,
    deleteUser} = require('../controllers/authController');

const {isAuthenticatedUser, authoriseRoles} = require('../middlewares/auth'); 


router.route('/register').post(registerUser); 
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/me').get(isAuthenticatedUser,getUserProfile);
router.route('/password/update').put(isAuthenticatedUser,updatePassword);
router.route('/me/update').put(isAuthenticatedUser,updateProfile);

router.route('/admin/users').get(isAuthenticatedUser,authoriseRoles('admin'),allUsers);
router.route('/admin/users/:id').get(isAuthenticatedUser,authoriseRoles('admin'),getUserDetails);
router.route('/admin/user/:id').put(isAuthenticatedUser,authoriseRoles('admin'),updateUserProfile);
router.route('/admin/user/:id').delete(isAuthenticatedUser,authoriseRoles('admin'),deleteUser);
module.exports = router;