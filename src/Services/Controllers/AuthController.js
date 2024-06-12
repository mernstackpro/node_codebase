"use strict";

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/public/users");
const dns = require('dns');
const { getKey, verifyUsingDNS } = require("verify-domain");
const { promisify } = require("util");


const { SendEmail } = require("../../libs/Helper");
const { generateTempPassword } = require("../../../utills/authUtils");

const fs = require("fs");

const crypto = require("crypto");
const Joi = require("joi");

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports.SignUp = async (req, res, next) => {
  try {
    let { name, email, password, role } = req.body;

    if (!email || !name || !password || !role) {
      return res.status(400).send({ message: "Content can not be empty!" });
    }

    const user = await User.find({ email: email });

    if (!user) {
      return res.send({
        status: 400,
        success: false,
        message: "Email already exists. Please try a different email.",
      });
    }

    //////////////////////////// Bcrypt User password
    if (password) {
      password = await bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
    }
    //////////////////////////// Create User
    const userNew = await User.create({
      name,
      email,
      password,
      role,
    });

    return res.send({
      status: 200,
      success: true,
      message: "Super Admin has been created",
    });
  } catch (error) {
    console.log("Error while trying to get data-------", error);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.socialSignIn = async (req, res, next) => {
  try {
    let request_body = req.body;
    const { email } = req.body;
    console.log('email', email)
    const user_detail = await User.findOne({
      email: req.body.email,
    });

    console.log('user_detail', user_detail)

    if (!user_detail) {
      return res.status(200).json({ success: false, message: "email not registered" });
    }


    var token = null;
    if (request_body?.role == "superadmin") {
      token = jwt.sign(
        { user_id: user_detail.id, role: "superadmin" },
        process.env.jwt_token_key,
        { expiresIn: "8h" }
      );
    } else if (request_body?.role == "admin") {
      token = jwt.sign(
        { user_id: user_detail.id, role: "admin" },
        process.env.jwt_token_key,
        { expiresIn: "8h" }
      );
    } else {
      token = jwt.sign(
        { user_id: user_detail.id, role: "user" },
        process.env.jwt_token_key,
        { expiresIn: "8h" }
      );
    }

    const orgInfo = await Organization.find({ userId: user_detail._id })

    let staffInfo;
    let staffOrg;

    if (user_detail.role == 'user') {
      staffInfo = await Staff.find({ userId: user_detail._id })
      staffOrg = await Organization.findById({ _id: staffInfo[0]?.organisationId })

      await User.updateOne({ _id: user_detail._id }, { status: 'Active' });

    }

    console.log('user_detail._id', user_detail._id)
    console.log('orgInfo', orgInfo)

    const userData = {
      id: user_detail._id,
      name: user_detail.name,
      email: user_detail.email,
      role: user_detail.role,
      planSelected: orgInfo[0]?.planSelected ? orgInfo[0].planSelected : [],
      organisationImgUrl: staffOrg?.profileImgUrl ? staffOrg.profileImgUrl : ""
    };

    return res.json({
      user: userData,
      status: 200,
      token: token,
      success: true,
      message: "Loggedd in successfully",
    });
  } catch (error) {
    console.log("SignIn error -------", error);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};


module.exports.SignIn = async (req, res, next) => {
  try {
    let request_body = req.body;
    const { email, password } = req.body;
    const user_detail = await User.findOne({
      email: req.body.email,
    });
    if (
      !user_detail ||
      !(await bcrypt.compare(request_body.password, user_detail.password))
    ) {
      return res.json({
        status: 400,
        success: false,
        message: "Username or password is incorrect",
      });
    }

    var token = null;
    if (request_body?.role == "superadmin") {
      token = jwt.sign(
        { user_id: user_detail.id, role: "superadmin" },
        process.env.jwt_token_key,
        { expiresIn: "8h" }
      );
    } else if (request_body?.role == "admin") {
      token = jwt.sign(
        { user_id: user_detail.id, role: "admin" },
        process.env.jwt_token_key,
        { expiresIn: "8h" }
      );
    } else {
      token = jwt.sign(
        { user_id: user_detail.id, role: "user" },
        process.env.jwt_token_key,
        { expiresIn: "8h" }
      );
    }

    const orgInfo = await Organization.find({ userId: user_detail._id })

    let staffInfo;
    let staffOrg;

    if (user_detail.role == 'user') {
      staffInfo = await Staff.find({ userId: user_detail._id })
      staffOrg = await Organization.findById({ _id: staffInfo[0]?.organisationId })
    }

    console.log('user_detail._id', user_detail._id)
    const staffData = await Staff.find({ organisationId: orgInfo._id })


    console.log('staffData length', staffData.length)


    
    console.log('domain verified', user_detail?.textRecord[0]?.domainVerified)
    console.log('providers verified', user_detail.providers.length)


    console.log('user_detail.checklist', user_detail)

    if (user_detail.textRecord[0]?.domainVerified) {
      user_detail.checklist[0] = true;
    } else {
      user_detail.checklist[0] = false;
    }

    if (user_detail.providers.length > 0) {
      user_detail.checklist[1] = true;
    } else {
      user_detail.checklist[1] = false;

    }
    if (staffData.length > 0) {
      user_detail.checklist[2] = true;
    } else {
      user_detail.checklist[2] = false;

    }

    user_detail.save()


    // return



    const userData = {
      id: user_detail._id,
      name: user_detail.name,
      email: user_detail.email,
      role: user_detail.role,
      providers: user_detail.providers ? user_detail.providers : null,
      checklist: user_detail.checklist ? user_detail.checklist : [false, false, false, false],
      planSelected: orgInfo[0]?.planSelected ? orgInfo[0].planSelected : [],
      organisationImgUrl: staffOrg?.profileImgUrl ? staffOrg.profileImgUrl : "",
      secretKey: user_detail.secretKey ? user_detail.secretKey : "",
      textRecord: user_detail.textRecord ? user_detail.textRecord : null,
      account:user_detail.accountStatus,
      deleted_user:user_detail.deleted_user,
    };
  

    return res.json({
      user: userData,
      status: 200,
      token: token,
      success: true,
      message: "Loggedd in successfully",
    });
  } catch (error) {
    console.log("SignIn error -------", error);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.ForgetPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    console.log(email);
    if (!email) {
      return res.status(400).send({ message: "email cannot be empty" });
    }
    const user = await User.findOne({ email });

    console.log("user")
    if (!user) {
      return res.status(200).json({ message: "User not exist!" ,success: false});
    }

    if (user.role == 'superadmin') {
      return res.status(200).json({ message: "Something went wrong" ,success: false});
    }
    if (user?.accountStatus == 'InActive') {
      return res.status(200).json({ message: "Your account Is deactivated.Please Check with your organisation" ,success: false});
    }
    if ( user?.deleted_user == 'Deleted') {
      return res.status(200).json({ message: "Your account Is Deleted." ,success: false});
    }

    

    let resetToken;
    if (user.role == 'admin') {
     resetToken = jwt.sign(
      { user_id: user._id, role: "admin" },
      process.env.jwt_token_key,
      { expiresIn: "48h" }
    );

  }


  if (user.role == 'user') {
     resetToken = jwt.sign(
      { user_id: user._id, role: "user" },
      process.env.jwt_token_key,
      { expiresIn: "48h" }
    );

  }

    const emailParameters = {

      user_email: email,
      verify_email_link: `${process.env.CLIENT_URL}/reset-email-password/${resetToken}/${user._id}`,
    };


    res.json({ message: "Reset password email sent Successfully" ,success:true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};