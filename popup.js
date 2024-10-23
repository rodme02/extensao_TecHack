document.addEventListener('DOMContentLoaded', () => {
    const reloadButton = document.getElementById('reload-btn');
    const showDomainsButton = document.getElementById('show-domains-btn');
    const domainList = document.getElementById('domain-list');

    // Load initial data when the popup is opened
    loadPopupData();

    // Reload button event listener
    reloadButton.addEventListener('click', () => {
        // Display "loading..." during reload
        displayLoadingState();

        // Refresh the current tab
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.reload(tabs[0].id, () => {
                // Allow time for network requests to complete after reload
                setTimeout(() => {
                    loadPopupData(); // Fetch updated data from background script
                }, 1500); // Adjust the delay if necessary
            });
        });
    });

    // Toggle domain list visibility
    showDomainsButton.addEventListener('click', () => {
        domainList.style.display = domainList.style.display === 'none' ? 'block' : 'none';
    });
});

// Load and display data in the popup
function loadPopupData() {
    chrome.runtime.sendMessage({ action: 'getPopupData' }, (response) => {
        if (response) {
            // Update third-party connections
            document.getElementById('third-party-count').innerText = response.thirdPartyConnections.count;
            updateDomainList(response.thirdPartyConnections.domains);

            // Update browser hijacking detection
            document.getElementById('hijacking-status').innerText = response.hijackingDetected ? 'Threat detected' : 'No threats detected';

            // Update local storage detection
            document.getElementById('local-storage-status').innerText = response.localStorageUsed ? 'Data stored' : 'No data stored';

            // Update cookies detection
            document.getElementById('first-party-cookies').innerText = response.cookies.firstParty;
            document.getElementById('third-party-cookies').innerText = response.cookies.thirdParty;
            document.getElementById('session-cookies').innerText = response.cookies.session;
            document.getElementById('persistent-cookies').innerText = response.cookies.persistent;
            document.getElementById('supercookies').innerText = response.cookies.supercookies;

            // Update canvas fingerprinting detection
            document.getElementById('canvas-status').innerText = response.canvasFingerprinting ? 'Fingerprinting detected' : 'No fingerprinting detected';

            // Update privacy score with progress bar and color coding
            updatePrivacyScore(response.privacyScore);
        }
    });
}

// Show "loading..." while data is recalculated
function displayLoadingState() {
    document.getElementById('third-party-count').innerText = 'loading...';
    document.getElementById('hijacking-status').innerText = 'loading...';
    document.getElementById('local-storage-status').innerText = 'loading...';
    document.getElementById('first-party-cookies').innerText = 'loading...';
    document.getElementById('third-party-cookies').innerText = 'loading...';
    document.getElementById('session-cookies').innerText = 'loading...';
    document.getElementById('persistent-cookies').innerText = 'loading...';
    document.getElementById('supercookies').innerText = 'loading...';
    document.getElementById('canvas-status').innerText = 'loading...';
    document.getElementById('privacy-score').innerText = 'loading...';
    document.getElementById('domain-list').innerHTML = '';  // Clear the domain list
}

// Update privacy score display with color and progress bar
function updatePrivacyScore(score) {
    const scoreElement = document.getElementById('privacy-score');
    const progressBar = document.getElementById('progress-fill');
    
    scoreElement.innerText = `Score: ${score}/100`;
    progressBar.style.width = `${score}%`;

    if (score > 75) {
        progressBar.style.backgroundColor = 'green';
        scoreElement.style.color = 'green';
    } else if (score >= 40) {
        progressBar.style.backgroundColor = 'yellow';
        scoreElement.style.color = 'yellow';
    } else {
        progressBar.style.backgroundColor = 'red';
        scoreElement.style.color = 'red';
    }
}

// Update list of third-party domains
function updateDomainList(domains) {
    const domainList = document.getElementById('domain-list');
    domainList.innerHTML = '';  // Clear the existing list
    domains.forEach(domain => {
        const li = document.createElement('li');
        li.innerText = domain;
        domainList.appendChild(li);
    });
}
