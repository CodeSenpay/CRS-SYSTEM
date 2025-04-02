const TotpAuthenticator = require("../utils/TotpAuthenticator");

const generateTotpCode = (req, res) => {
  const totpAuthenticator = new TotpAuthenticator();
  try {
    const params = totpAuthenticator.parseOtpauthUri(req.body.uri);
    const totpCode = totpAuthenticator.generateTotp(
      params.secret,
      params.digits,
      params.period
    );

    res.json({ totpCode });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { generateTotpCode };
