const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  auth: {
    user: "utkarsh3639@gmail.com",
    pass: process.env.APP_GMAIL_PASSWORD,
  },
});
const sendVerificationEmail = (email, token) => {
  const url = `localhost:5000/confirm/${token}`;
  transporter.sendMail({
    to: email,
    subject: "Confirm your email",
    html: `
            <h1>Confirm your email</h1>
            <p>Please click on the following link to confirm your email:</p>
            <a href=${url} >Confirm Email</a>`,
  });
};
module.exports = { sendVerificationEmail };
