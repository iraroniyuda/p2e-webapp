const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "", // pastikan ini domain email VPS-mu
  port: 587,
  secure: false, // pakai STARTTLS, bukan SSL langsung
  auth: {
    user: "",
    pass: "",
  },
  tls: {
    rejectUnauthorized: false, // kalau belum punya cert valid (self-signed)
  },
});

/**
 * Kirim email ke user
 * @param {string} to - Alamat email tujuan
 * @param {string} subject - Subjek email
 * @param {string} text - Isi email (plaintext)
 */
const sendEmail = async (to, subject, text) => {
  await transporter.sendMail({
    from: '"" ',
    to,
    subject,
    text,
  });
};

module.exports = sendEmail;
