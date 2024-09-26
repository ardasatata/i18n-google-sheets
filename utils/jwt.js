const { JWT } = require( 'google-auth-library');

const serviceAccountAuth = (email, key) => {
  return new JWT({
    email: email,
    key: key,
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
}

module.exports = serviceAccountAuth