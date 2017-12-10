const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const juice = require('juice');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

exports.send = async (options) => {
  const mailOptions = {
    from: `Simon <noreply@test.com>`,
    to: options.user.email,
    subject: options.subject,
    html: `filled in later`,
    text: `filled in later`,
  };

  const sendMail = promisify(transport.sendMail, transport);
  return sendMail(mailOptions);
};
