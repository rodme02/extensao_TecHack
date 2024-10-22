let thirdPartyConnections = [];
let cookieData = {
  firstParty: 0,
  thirdParty: 0,
  sessionCookies: 0,
  persistentCookies: 0
};
let canvasFingerprintDetected = false;
let hijackingDetected = false;
let collectingData = false;  // Flag to indicate whether we're collecting data or not

// Function to reset all stored data
function resetData() {
  thirdPartyConnections = []; // Properly reset third-party connections here
  cookieData = {
    firstParty: 0,
    thirdParty: 0,
    sessionCookies: 0,
    persistentCookies: 0
  };
  canvasFingerprintDetected = false;
  hijackingDetected = false;
  collectingData = false; // Stop collecting until the page reload completes
  console.log("Data has been reset.");
}

// Function to check if the domain is a third-party domain
function isThirdParty(url, tabUrl) {
  try {
    if (!url || !tabUrl) {
      return false;
    }
    let urlObj = new URL(url);
    let tabUrlObj = new URL(tabUrl);
    return urlObj.hostname !== tabUrlObj.hostname;
  } catch (error) {
    console.error('Error parsing URL:', error, 'URL:', url, 'Tab URL:', tabUrl);
    return false;
  }
}

// Function to get cookies for a particular domain
function getCookies(domain) {
  browser.cookies.getAll({ domain: domain }).then((cookies) => {
    cookies.forEach(cookie => {
      if (isThirdPartyCookie(cookie)) {
        cookieData.thirdParty += 1;
      } else {
        cookieData.firstParty += 1;
      }
      if (cookie.session) {
        cookieData.sessionCookies += 1;
      } else {
        cookieData.persistentCookies += 1;
      }
    });
  }).catch(error => {
    console.error("Error retrieving cookies:", error);
  });
}

// Function to check if a cookie is a third-party cookie
function isThirdPartyCookie(cookie) {
  return cookie.firstPartyDomain === '' || cookie.domain !== cookie.firstPartyDomain;
}

// Function to handle webRequest for detecting third-party connections
function handleWebRequest(details) {
  if (!collectingData) return;  // Only collect data if we're in the data collection phase
  let tabUrl = details.originUrl || details.documentUrl || details.initiator || '';  // Change from const to let
  
  if (details.type === "main_frame") {
    tabUrl = details.url; // For main frame requests, the URL is the page itself.
  }

  if (details.url && tabUrl) {
    if (isThirdParty(details.url, tabUrl)) {
      thirdPartyConnections.push(details.url);
    }
  }
}

// Function to handle completed requests (cookies)
function handleWebRequestCompleted(details) {
  if (!collectingData) return;  // Only collect cookies if we're in the data collection phase
  const urlObj = new URL(details.url);
  getCookies(urlObj.hostname);
}

// Initialize listeners for webRequest (must be called after reset)
function reinitializeListeners() {
  // First remove any existing listeners
  browser.webRequest.onBeforeRequest.removeListener(handleWebRequest);
  browser.webRequest.onCompleted.removeListener(handleWebRequestCompleted);

  // Add fresh listeners
  browser.webRequest.onBeforeRequest.addListener(handleWebRequest, { urls: ["<all_urls>"] });
  browser.webRequest.onCompleted.addListener(handleWebRequestCompleted, { urls: ["<all_urls>"] });
  console.log("Listeners have been reinitialized.");
}

// Handle tab updates to ensure data is captured after reload
function handleTabUpdate(tabId, changeInfo, tab) {
  if (changeInfo.status === "complete" && tab.active) {
    console.log(`Tab reload completed for: ${tab.url}`);
    
    // Now that the tab has reloaded, start collecting new data
    collectingData = true;
    collectDataFromTab(tab);  // Trigger data collection after reload
  }
}

// Manually trigger data collection after the tab reloads
function collectDataFromTab(tab) {
  const tabUrl = tab.url;

  if (tabUrl) {
    // Simulate capturing third-party requests on page load
    browser.webRequest.onBeforeRequest.addListener(
      function(details) {
        if (details.url && isThirdParty(details.url, tabUrl)) {
          thirdPartyConnections.push(details.url);
        }
      },
      { urls: ["<all_urls>"], tabId: tab.id }
    );

    // Capture cookies from the reloaded tab's domain
    getCookies(new URL(tab.url).hostname);
  }
}

// Reload the current active tab to re-trigger the extension's data collection
function reloadCurrentTab() {
  browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      collectingData = false; // Stop collecting data until the page fully reloads
      console.log("Tab will be reloaded.");
      browser.tabs.reload(activeTab.id);  // Reload the active tab
    }
  });
}

// Listener for popup request to send the gathered data
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getExtensionData") {
    sendResponse({
      thirdPartyConnections: thirdPartyConnections,
      cookieData: cookieData,
      canvasFingerprintDetected: canvasFingerprintDetected,
      hijackingDetected: hijackingDetected,
      privacyScore: calculatePrivacyScore()
    });
  } else if (request.action === "resetData") {
    resetData();             // Step 1: Reset the data
    reinitializeListeners();  // Step 2: Reinitialize listeners to start capturing new data
    reloadCurrentTab();       // Step 3: Reload the active tab to trigger data collection
    sendResponse({ status: 'Data reset, listeners reinitialized, and tab reloaded.' });
  }
});

// Calculate privacy score based on the collected data
function calculatePrivacyScore() {
  let score = 100;
  if (thirdPartyConnections.length > 5) score -= 20;
  if (cookieData.thirdParty > 5) score -= 20;
  if (canvasFingerprintDetected) score -= 20;
  if (hijackingDetected) score -= 20;
  if (cookieData.persistentCookies > 5) score -= 20;
  return score;
}

// Set up tab update listener to capture data when the tab reload completes
browser.tabs.onUpdated.addListener(handleTabUpdate);

// Initialize listeners on first load
reinitializeListeners();
