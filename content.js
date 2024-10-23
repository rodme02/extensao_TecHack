// Canvas Fingerprinting Detection
function detectCanvasFingerprinting() {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;

    // Override the default toDataURL method
    HTMLCanvasElement.prototype.toDataURL = function() {
        chrome.runtime.sendMessage({ action: 'canvasFingerprintingDetected' });
        return originalToDataURL.apply(this, arguments);
    };

    // Override the default getImageData method
    CanvasRenderingContext2D.prototype.getImageData = function() {
        chrome.runtime.sendMessage({ action: 'canvasFingerprintingDetected' });
        return originalGetImageData.apply(this, arguments);
    };
}

// Detect HTML5 Local Storage usage directly from the page (as a backup check)
function detectLocalStorageUsage() {
    if (localStorage.length > 0 || sessionStorage.length > 0) {
        chrome.runtime.sendMessage({ action: 'localStorageUsed', used: true });
    }
}

// Detect Browser Hijacking by checking for non-standard ports (ports not 80 or 443)
function detectBrowserHijacking() {
    // Listen for completed network requests
    chrome.webRequest.onCompleted.addListener(
        (details) => {
            const url = new URL(details.url);
            const port = url.port || (url.protocol === 'https:' ? '443' : '80');  // Default ports if none specified

            // Check if the port is not 80 (HTTP) or 443 (HTTPS)
            if (port !== '80' && port !== '443') {
                console.warn(`Suspicious port detected: ${port} on ${url.hostname}`);
                chrome.runtime.sendMessage({ action: 'hijackingDetected', reason: `Non-standard port: ${port}` });
            }
        },
        { urls: ["<all_urls>"] }  // Capture requests to all URLs
    );
}


// Execute detection functions
detectCanvasFingerprinting();
detectLocalStorageUsage();
detectBrowserHijacking();
