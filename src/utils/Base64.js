function encodeBase64(text) {
    return Buffer.from(text, 'utf8').toString('base64');
  }
  function decodeBase64(base64) {
    return Buffer.from(base64, 'base64').toString('utf8');
  }
  
  module.exports = {
    encodeBase64,
    decodeBase64,
  };