const crypto = require('crypto');
const SECRET_KEY = crypto.randomBytes(32).toString('hex');
console.log(SECRET_KEY);
