require('dotenv');
const nodemailer = require('nodemailer');

const smtpTransporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'notifications.productized@gmail.com',
    pass: process.env.NODEMAILER_PASS,
  },
});

const sendNodemailer = () => {
  const mailOptions = {
    from: `Productized <notifications.productized@gmail.com>`,
    to: 'andremdpereira@gmail.com',
    subject: `Workshop registration`,
    text: `You are now registered.`,
  };

  smtpTransporter.sendMail(mailOptions, (error, response) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Confirmation email sent!`);
    }
    smtpTransporter.close();
  });
};

module.exports = sendNodemailer;
