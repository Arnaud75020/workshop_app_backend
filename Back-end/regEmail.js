const nodemailer = require('nodemailer');

const smtpTransporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'hackathon2medicationreminder@gmail.com',
    pass: 'medrem2020',
  },
});

const sendNodemailer = () => {
  const mailOptions = {
    from: `Productized <hackathon2medicationreminder@gmail.com>`,
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
