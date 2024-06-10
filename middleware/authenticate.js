const admin = require('firebase-admin');

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized, You need to login to access this route.',
      status: 401
    })
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({
      message: 'Unauthorized, token is invalid',
    })
  }
};

module.exports = authenticate;
