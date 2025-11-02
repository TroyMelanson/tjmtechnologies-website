// auth.js
const msalConfig = {
  auth: {
    clientId: "YOUR_CLIENT_ID_HERE",
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "https://digitalmar.tjmtechnologies.ca"
  }
};

const msalInstance = new msal.PublicClientApplication(msalConfig);

async function signIn() {
  try {
    const loginResponse = await msalInstance.loginPopup({
      scopes: ["User.Read"]
    });
    console.log("Login successful:", loginResponse);
    document.getElementById("status").innerText = `Welcome, ${loginResponse.account.username}`;
  } catch (error) {
    console.error("Login failed:", error);
  }
}
