const CryptoJS = require('crypto-js');

const SECRET_KEY ='fa6591d305699af21e132b59e925158e837c93b73b953515e66c3d8db2a23049';

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

const decryptData = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

module.exports = {
  encryptData,
  decryptData
};
