const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API);

module.exports = sgMail;
