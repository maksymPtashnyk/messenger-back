const nodemailer = require('nodemailer')

class MailService {

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_POST,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    })
  }

  async sendActivationEmail (to, link) {
    await this.transporter.sendMail({
      from: process.env.SMTP_USER,
      to,
      subject: 'Activates account at' + process.env.API_URL,
      text: '',
      html: 
          `
              <div>
                <h1>For activated account allow the link</h1>
                <a href="${link}">${link}</a>
              </div>
          `
    })
  }
}

module.exports = new MailService();