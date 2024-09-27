chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "authenticate") {
        const clientId = request.clientId; // Use the clientId passed from React
        const clientSecret = request.clientSecret;
        const redirectUri = chrome.identity.getRedirectURL();
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user`;

        chrome.identity.launchWebAuthFlow(
            {
                url: authUrl,
                interactive: true,
            },
            function (redirectUrl) {
                if (chrome.runtime.lastError || !redirectUrl) {
                    sendResponse({ error: chrome.runtime.lastError.message });
                    return;
                }

                const urlParams = new URLSearchParams(new URL(redirectUrl).search);
                const code = urlParams.get("code");

                fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify({
                        client_id: clientId,
                        client_secret: clientSecret,
                        code: code,
                    }),
                })
                    .then((response) => response.json())
                    .then((data) => {
                        if (data.error) {
                            sendResponse({ error: data.error_description });
                        } else {
                            chrome.storage.local.set(
                                { githubToken: data.access_token },
                                () => {
                                    sendResponse({ success: true });
                                }
                            );
                        }
                    });

                return true;
            }
        );
    }
});

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     if (request.action === "redirectToYouTube") {
//         chrome.tabs.create({ url: "https://youtube.com" }, () => {
//             sendResponse({ status: "Redirected to YouTube" });
//         });
//         return true; // Keeps the message channel open for sendResponse
//     }
// });
