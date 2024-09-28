import apiClient from "../src/config/apiClient.js";


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "authenticate") {
        const clientId = request.clientId;
        const redirectUri = chrome.identity.getRedirectURL();
        const authenticate_url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

        chrome.identity.launchWebAuthFlow({
            url: authenticate_url,
            interactive: true
        }, async (redirectUrl) => {
            if (chrome.runtime.lastError || !redirectUrl) {
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }

            // Parse the redirect URL to get the authorization code
            const url = new URL(redirectUrl);
            const code = url.searchParams.get("code");

            if (code) {
                console.log(`Authorization code: ${code}`);
                try {
                    const response = await apiClient.post('/auth/github/callback', {
                        code: code
                    });

                    const { access_token } = response.data;
                    console.log('Access Token:', access_token);

                    sendResponse({ status: "success", access_token });
                } catch (err) {
                    console.error('Error sending authorization code:', err);
                    sendResponse({ status: "error", message: "Failed to get access token" });
                }
            } else {
                sendResponse({ status: "error", message: "No code received" });
            }
        });

        return true;
    }
});


chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        console.log('Keeping service worker alive');
    }
});