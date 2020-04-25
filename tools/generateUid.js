function generateUid() {
  return Date.now() + Math.floor(Math.random() * 10).toString();
}

module.exports = generateUid;
