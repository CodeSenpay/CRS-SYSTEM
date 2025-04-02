const crypto = require("crypto");

class TotpAuthenticator {
  parseOtpauthUri(uri) {
    if (!uri.startsWith("otpauth://totp/")) {
      throw new Error("Invalid otpauth URI");
    }
    const uriParts = uri.slice("otpauth://totp/".length).split("?");
    const accountName = uriParts[0];
    const params = new URLSearchParams(uriParts[1]);

    const secret = params.get("secret") || "";
    const issuer = params.get("issuer") || "";
    const digits = parseInt(params.get("digits"), 10) || 6;
    const period = parseInt(params.get("period"), 10) || 30;

    return { accountName, secret, issuer, digits, period };
  }

  decodeBase32(secret) {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let bits = "";
    const decoded = [];

    for (let i = 0; i < secret.length; i++) {
      const val = base32Chars.indexOf(secret[i].toUpperCase());
      if (val === -1) throw new Error("Invalid Base32 character");
      bits += val.toString(2).padStart(5, "0");
    }

    for (let j = 0; j + 8 <= bits.length; j += 8) {
      decoded.push(parseInt(bits.slice(j, j + 8), 2));
    }

    return Buffer.from(decoded);
  }

  // Custom Base32 encoding function
  encodeBase32(bytes) {
    const base32Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    let output = "";
    let buffer = 0;
    let bitsLeft = 0;

    for (const byte of bytes) {
      buffer = (buffer << 8) | byte;
      bitsLeft += 8;
      while (bitsLeft >= 5) {
        bitsLeft -= 5;
        output += base32Chars[(buffer >> bitsLeft) & 31];
      }
    }

    if (bitsLeft > 0) {
      output += base32Chars[(buffer << (5 - bitsLeft)) & 31];
    }

    return output;
  }

  generateTotp(secret, digits = 6, period = 30, stepOffset = 0) {
    const decodedSecret = this.decodeBase32(secret);
    console.log("Decoded Secret:", decodedSecret);
    const currentTimeStep = Math.floor(Date.now() / 1000 / period);
    const adjustedTimeStep = currentTimeStep + stepOffset;
    console.log("Time Step:", adjustedTimeStep);

    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(adjustedTimeStep), 0);

    const hmac = crypto.createHmac("sha1", decodedSecret);
    hmac.update(timeBuffer);
    const hmacResult = hmac.digest();

    const offset = hmacResult[hmacResult.length - 1] & 0x0f;
    const binaryCode =
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff);

    const totpCode = binaryCode % 10 ** digits;
    return totpCode.toString().padStart(digits, "0");
  }

  async generateSecretKey() {
    const randomBytes = crypto.randomBytes(10);
    return this.encodeBase32(randomBytes);
  }
}

module.exports = TotpAuthenticator;
