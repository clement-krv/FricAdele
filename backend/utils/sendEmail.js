const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  try {
    // Vérifier que les variables d'environnement sont présentes
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('Configuration email manquante: SMTP_USER et SMTP_PASS requis');
    }

    console.log('📧 Configuration email:', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      from: process.env.FROM_EMAIL
    });

    // Create transporter with Gmail configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true pour le port 465, false pour 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Vérification de la connexion
    await transporter.verify();
    console.log('✅ Connexion SMTP vérifiée avec succès');

    // Define email options
    const mailOptions = {
      from: `${process.env.FROM_NAME || 'FricAdele'} <${process.env.SMTP_USER}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    console.log('📤 Envoi email vers:', options.email);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email envoyé avec succès:', info.messageId);

    return info;
  } catch (error) {
    console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Erreur d'envoi email: ${error.message}`);
  }
};

module.exports = sendEmail;
