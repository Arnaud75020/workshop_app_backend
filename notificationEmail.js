require('dotenv');
const nodemailer = require('nodemailer');
const cron = require('node-cron');

const smtpTransporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'hackathon2medicationreminder@gmail.com', // change to Productized email and password
    pass: process.env.NODEMAILER_PASS, // change to Productized email and password
  },
});

const sendNodemailer = (formData) => {
  console.log('formData formData formData', formData);
  const mailOptions = {
    from: 'Productized <hackathon2medicationreminder@gmail.com>', // change to 'Productized <productized email>'
    to: `${
      formData.emailsList ? formData.emailsList : 'andremdpereira@gmail.com'
    }`, // change to email(s) from email list
    subject: `${formData.subject}`,
    text: `${formData.content}`,
  };

  const dateArray = formData.date.split(/[-T:]/).map(Number);

  console.log(dateArray);

  cron.schedule(
    `${dateArray[4]} ${dateArray[3]} ${dateArray[2]} ${dateArray[1]} *`,
    () => {
      smtpTransporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          console.log(error);
        } else {
          console.log(`Notification email sent!`);
        }
        smtpTransporter.close();
      });
    }
  );
};

module.exports = sendNodemailer;
