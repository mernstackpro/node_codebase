let express = require("express");
const multer = require("multer");
const Joi = require("joi");
const cron = require('node-cron');


const router = express.Router();

/*** Middleware ***/
const authorize = require("../middleware/authorize");
const { validateLogin } = require("../middleware/validateRequest");

/*** Application Controllers ***/
const AuthController = require("./Controllers/AuthController");
const UserController = require("./Controllers/UserController");
const TemplateController = require("./Controllers/TemplateController");

const Quiz = require("./models/public/Quiz");
const Course = require("./models/public/Course");
const Group = require("./models/public/Group");
const mongoose = require("mongoose");
const  { sendCampaignEmails, sendCourseEmailReminders ,sendProgramEmailReminders} = require("./Controllers/EmailController");


/*** Auth Routers ***/
router.post("/api/SignIn", validateLogin, AuthController.SignIn);
router.post("/api/social-sign-in", AuthController.socialSignIn);

router.post('/api/verify-domain', AuthController.verifyDomain)
router.post('/api/check-verification', authorize(), AuthController.checkVerification)
router.get('/api/check-verification/:domain/:txtRecordValue', AuthController.checkVerification)


router.post("/api/SignUp", AuthController.SignUp);
router.post("/api/ForgetPassword", AuthController.ForgetPassword);

router.post("/api/ResetPassword", authorize(), AuthController.ResetPassword);
router.post("/api/resetForgetPassword", authorize(), AuthController.ResetForgetPassword);

router.post(
  "/api/EmailResetPassword",
  authorize(),
  AuthController.EmailResetPassword
);

/*** Super Admin ***/
router.post("/api/create-user", UserController.createUser);
router.get("/api/get-user", upload.none(), UserController.getUser);
router.post(
  "/api/update-user/:id",
  authorize(),
  upload.none(),
  UserController.updateUser
);




cron.schedule('00 11 * * *', async () => {
  try {
    // Call the function to send email reminders
    console.log('Email reminders triggered successfully');

    await sendCourseEmailReminders();
    console.log('Email reminders triggered successfully');
  } catch (error) {
    console.error('Error triggering email reminders:', error);
  }
});


cron.schedule('0 14 * * *', async () => {
  try {
    // Call the function to send email reminders
    await sendCampaignEmails();
    console.log('Email campaign triggered successfully');
  } catch (error) {
    console.error('Error triggering email reminders:', error);
  }
});

module.exports = router;
