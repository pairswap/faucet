const axios = require('axios');

async function validate({ signature }) {
  const { data } = await axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${signature}`
  );

  if (!data.success) {
    throw new Error('Signature is invalid');
  }
}

module.exports = {
  validate,
};
