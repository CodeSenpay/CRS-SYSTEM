import axios from "axios";
export async function isMFAEnabled(user) {
  const response = await axios.post(
    "http://localhost:3000/api/auth/checkMFA",
    { email: user },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (response.data.statuscode === 200) {
    return true;
  } else {
    return false;
  }
}

export async function generateSecretKey(user) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/generateSecret",
      { email: user },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    return err;
  }
}

export async function viewTotpCode(uri) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/generateTotp",
      { uri },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    return err;
  }
}

export async function storeSecret(data) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/storeSecret",
      { email: data.user, secret: data.secret },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    return err;
  }
}

export async function verifyTOTP(data) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/verify-totp",
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.log(err.message);
  }
}

export async function verifyTOTPLogin(data) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/verify-totp-login",
      data,
      { headers: { "Content-Type": "application/json" }, withCredentials: true }
    );
    return response.data;
  } catch (err) {
    console.log(err.message);
  }
}

export async function getUserLevel(user) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/getUserLevel",
      user,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.log(err.message);
  }
}
export async function getSecretKey(data) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/getSecret",
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (err) {
    console.log(err.message);
  }
}

export async function getMiscellaneousFeeTotal(degreeId) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/system/get-miscellaneous-fees-total",
      { degree_id: degreeId }
    );
    if (response.data.statuscode != 1) {
      return;
    }
    return response.data;
  } catch (err) {
    console.log(err.message);
  }
}

export async function getMiscellaneousFees(degreeId) {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/system/get-miscellaneous-fees",
      { degree_id: degreeId }
    );
    if (response.data.statuscode != 1) {
      return;
    }
    return response.data;
  } catch (err) {
    console.log(err.message);
  }
}

export async function verifyUser() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/auth/verify-jwt",
      {
        withCredentials: true,
      }
    );

    return response.data.user;
  } catch (err) {
    console.log(err.message);
  }
}
