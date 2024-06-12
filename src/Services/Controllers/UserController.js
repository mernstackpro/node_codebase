const bcrypt = require("bcrypt");
const User = require("../models/public/users");
const Joi = require('joi');
const UsersTestDetails = require("../models/public/UsersDetails");
const courseStatus = require('../models/public/courseStatus')
const Campaign = require('../models/public/Campaign');
const EmailStatus = require('../models/public/EmailStatus')
const { SendEmail } = require("../../libs/Helper");
const { NotificationAdd } = require('./../../libs/Helper')
const path = require("path");
const { generateTempPassword } = require("../../../utills/authUtils");
const jwt = require("jsonwebtoken");
const UserActivity = require('../models/public/UserActivtiy');
const tempPassword = generateTempPassword();
const password = bcrypt.hashSync(tempPassword, bcrypt.genSaltSync(10), null);
const ProgramStatus = require('../models/public/programStatus')

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
const fs = require("fs");
const CryptoJS = require('crypto-js');

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const { promisify } = require("util");
const csv = require("csv-parser");

require("dotenv").config({
  path: __dirname + "/.env",
});
const Staff = require("../models/public/Staff");
const Template = require("../models/public/Template");


module.exports.getUser = async (req, res, next) => {
  try {
    const result = Joi.validate(req.body, schema);
    if (result.error) {
      return res.status(400).json({
        error: result.error.details[0].message,
      });
    }
    const users = await User.find();
    return res.json({
      status: 200,
      response: users,
      success: true,
      message: "Data found",
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

module.exports.createUser = async (req, res, next) => {
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

module.exports.updateUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const { id } = req.params;

    if (!name || !email) {
      return res.json({
        status: 400,
        success: false,
        message: "field cannot be empty",
      });
    }

    const user = await User.findById(id);

    if (user) {
      await User.findByIdAndUpdate(id, {
        name,
        email,
        role: "admin",
      });
      return res.json({
        status: 200,
        success: true,
        message: "Profile updated",
      });
    } else {
      return res.send({
        status: 400,
        success: false,
        message: "User not exist!",
      });
    }
  } catch (error) {
    console.log(error.message);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};

module.exports.deleteUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);

    // return res.send(user);
    if (user) {
      await User.findByIdAndDelete(id);
      return res.json({
        status: 200,
        success: true,
        message: "User deleted",
      });
    } else {
      return res.send({
        status: 400,
        success: false,
        message: "User not exist!",
      });
    }
  } catch (error) {
    console.log("Error while trying to get data-------", error);
    return res.json({
      status: 400,
      success: false,
      message: error.message,
    });
  }
};


exports.emailOpenStatus = async (req, res) => {
  const { id, email } = req.params;

  try {
    console.log("email++++++++++++++++++++++++",email)
  
    console.log("email++++++++++++++++++++++++",id)

    const UserCampaign = await EmailStatus.find({ campaignId: id, email: email });
    if (!UserCampaign) {
      return res.status(404).json({ message: "user not found" });
    }

    await EmailStatus.updateOne({ campaignId: id, email: email }, { $set: { emailOpen: 'Open' } });

    const imagePath = path.join(__dirname, '../../../public/images/secureAZ.svg');
    const image = fs.readFileSync(imagePath);

    // Set content type header and send the image data as response
    res.set('Content-Type', 'image/png');
    res.send(image);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};




