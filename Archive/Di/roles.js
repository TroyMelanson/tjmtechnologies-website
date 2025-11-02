// roles.js
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "./authConfig.js"; // adjust if your file has a different name

const msalInstance = new PublicClientApplication(msalConfig);

async function handleLogin() {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length === 0) {
    await msalInstance.loginRedirect(loginRequest);
  } else {
    const account = accounts[0];
    msalInstance.setActiveAccount(account);
    displayRoleUI(account);
  }
}

async function displayRoleUI(account) {
  try {
    const response = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account: account,
    });

    const idToken = response.idTokenClaims;
    const groups = idToken.groups || [];

    // Map group IDs to friendly roles
    const roleMap = {
      "217eef1d-063c-4816-97ae-19a86d7cd014": "Nurse",
      "3e27ea53-f3ad-416e-802a-f02830c8c10b": "Owner",
      "44b13eb7-5dc7-439f-8541-59178cf80baa": "Pharmacy",
    };

    let userRole = "Unknown";
    for (const groupId of groups) {
      if (roleMap[groupId]) {
        userRole = roleMap[groupId];
        break;
      }
    }

    document.getElementById("userRole").textContent = `Role: ${userRole}`;

    // Display UI based on role
    if (userRole === "Owner") {
      document.getElementById("ownerSection").style.display = "block";
    } else if (userRole === "Pharmacy") {
      document.getElementById("pharmacySection").style.display = "block";
    } else if (userRole === "Nurse") {
      document.getElementById("nurseSection").style.display = "block";
    } else {
      document.getElementById("defaultSection").style.display = "block";
    }
  } catch (error) {
    console.error("Error loading role info:", error);
  }
}

document.addEventListener("DOMContentLoaded", handleLogin);
