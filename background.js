let privacyData = {
    thirdPartyConnections: {
        count: 0,
        domains: []
    },
    hijackingDetected: false,
    localStorageUsed: false,
    cookies: {
        firstParty: 0,
        thirdParty: 0,
        session: 0,
        persistent: 0,
        supercookies: 0
    },
    canvasFingerprinting: false,
    privacyScore: 100 // Ensure this is initially set to 100
};

// Reset all privacy data and set the privacy score back to 100
function resetPrivacyData() {
    privacyData = {
        thirdPartyConnections: {
            count: 0,
            domains: []
        },
        hijackingDetected: false,
        localStorageUsed: false,
        cookies: {
            firstParty: 0,
            thirdParty: 0,
            session: 0,
            persistent: 0,
            supercookies: 0
        },
        canvasFingerprinting: false,
        privacyScore: 100 // Reset privacy score to 100
    };
}

// Recalculate all privacy data (third-party connections, local storage, cookies)
function recalculateAllData(tabId) {
    detectLocalStorage(tabId);  // Detect and update local storage usage
    detectCookies();  // Detect and update cookies
    calculatePrivacyScore();  // Recalculate privacy score once all values are updated
}

// Detect third-party connections using web requests
chrome.webRequest.onCompleted.addListener((details) => {
    const url = new URL(details.url);
    const domain = url.hostname;

    // Check if it's a third-party domain
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const mainDomain = new URL(tabs[0].url).hostname;
        if (domain !== mainDomain && !privacyData.thirdPartyConnections.domains.includes(domain)) {
            privacyData.thirdPartyConnections.domains.push(domain);
            privacyData.thirdPartyConnections.count++;
            calculatePrivacyScore();  // Update the privacy score whenever a third-party domain is detected
        }
    });
}, {urls: ["<all_urls>"]});

// Listen for page reloads or updates and reset all data
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
    if (changeInfo.status === "complete") {
        resetPrivacyData();  // Reset everything to default
        recalculateAllData(tabId);  // Recalculate all data after reset
    }
});

// Detect local storage usage
function detectLocalStorage(tabId) {
    chrome.tabs.executeScript(tabId, {code: 'localStorage.length'}, (result) => {
        privacyData.localStorageUsed = result && result[0] > 0;
    });
}

// Detect cookies and categorize them
function detectCookies() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.cookies.getAll({url: tabs[0].url}, (cookies) => {
            resetCookieData();  // Reset cookies data before recalculating
            cookies.forEach(cookie => {
                const isThirdParty = cookie.domain !== new URL(tabs[0].url).hostname;
                const isSession = !cookie.expirationDate;

                if (isThirdParty) {
                    privacyData.cookies.thirdParty++;
                } else {
                    privacyData.cookies.firstParty++;
                }

                if (isSession) {
                    privacyData.cookies.session++;
                } else {
                    privacyData.cookies.persistent++;
                }

                // Detect supercookies
                if (cookie.name.includes('supercookie')) {
                    privacyData.cookies.supercookies++;
                }
            });

            // After processing cookies, recalculate the privacy score
            calculatePrivacyScore();
        });
    });
}

// Reset cookie data
function resetCookieData() {
    privacyData.cookies.firstParty = 0;
    privacyData.cookies.thirdParty = 0;
    privacyData.cookies.session = 0;
    privacyData.cookies.persistent = 0;
    privacyData.cookies.supercookies = 0;
}

function calculatePrivacyScore() {
    let baseScore = 100;  // Base score starts at 100
    let score = baseScore;

    // Capped deduction for third-party connections, max 20 points deducted
    const thirdPartyConnectionCount = privacyData.thirdPartyConnections.count;
    if (thirdPartyConnectionCount > 0) {
        if (thirdPartyConnectionCount <= 10) {
            score -= thirdPartyConnectionCount * 2;  // Small impact for few connections
        } else {
            score -= 20;  // Max impact capped at 20 points for high counts
        }
    }

    // Deduction for local storage usage, capped at 5 points
    if (privacyData.localStorageUsed) {
        score -= 15;
    }

    // Capped deduction for third-party cookies, max 15 points deducted
    const thirdPartyCookies = privacyData.cookies.thirdParty;
    if (thirdPartyCookies > 0) {
        if (thirdPartyCookies <= 10) {
            score -= thirdPartyCookies * 2;  // Small impact for few cookies
        } else {
            score -= 25;  // Higher impact, but cap it at 15 points
        }
    }

    // Supercookies have high severity
    if (privacyData.cookies.supercookies > 0) {
        score -= 20;  // Keep the high severity
    }

    // Canvas fingerprinting is severe, but cap it at 20 points
    if (privacyData.canvasFingerprinting) {
        score -= 25;  // High severity, but not too punishing
    }

    // Hijacking detection, very severe, but capped at 30 points
    if (privacyData.hijackingDetected) {
        score -= 30;
    }

    // Ensure the score doesn't drop below 0 or exceed 100
    privacyData.privacyScore = Math.max(0, Math.min(100, score));
}

// Handle reload requests and send updated data to the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'reloadData') {
        resetPrivacyData();  // Reset everything to default
        recalculateAllData(null);  // Recalculate all data after reset
        sendResponse(privacyData);  // Send updated data back to the popup
    } else if (message.action === 'getPopupData') {
        sendResponse(privacyData);  // Send current privacy data to the popup
    }
});
