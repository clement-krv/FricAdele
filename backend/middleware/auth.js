const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  console.log(`🔐 Auth middleware - Token présent: ${!!token}, URL: ${req.path}`);

  if (!token) {
    console.log('❌ Token manquant');
    return res.status(401).json({
      success: false,
      message: 'Accès non autorisé, token manquant'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token décodé pour utilisateur: ${decoded.id}`);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé dans la DB');
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      console.log('❌ Compte utilisateur désactivé');
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    console.log(`👤 Utilisateur authentifié: ${user.name} (${user.email})`);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Token invalide'
    });
  }
};

module.exports = { protect };
