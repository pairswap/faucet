const axios = require('axios');

async function verify(token) {
  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
  );

  return data.success;
}

module.exports = {
  verify,
};
