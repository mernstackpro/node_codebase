const nodemailer = require("nodemailer");
const Notification = require('../Services/models/public/Notification')
const User = require('../Services/models/public/users')


module.exports.SendEmail = async (mailOptions) => {
    return new Promise((resolve, reject) => {
        let transporter = nodemailer.createTransport({

            port: process.env.MAIL_PORT,
            host: process.env.MAIL_HOST,
            secure: false,
            auth: {
                user: process.env.MAIL_USERNAME,
                pass: process.env.MAIL_PASSWORD,
            },
            
            
        });
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                reject(error);
            } else {
                resolve(info);
            }
        });
    });
};

