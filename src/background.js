import apiClient from "./config/apiClient.js";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const handleAuthenticate = async () => {
        try {
            const clientId = request.clientId;
            const redirectUri = chrome.identity.getRedirectURL();
            const authenticate_url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

            chrome.identity.launchWebAuthFlow({ url: authenticate_url, interactive: true }, async (redirectUrl) => {
                if (chrome.runtime.lastError || !redirectUrl) {
                    sendResponse({ error: chrome.runtime.lastError ? chrome.runtime.lastError.message : "No redirect URL" });
                    return;
                }

                const url = new URL(redirectUrl);
                const code = url.searchParams.get("code");
                if (code) {
                    console.log(`Authorization code: ${code}`);
                    try {
                        const response = await apiClient.post('/auth/github/callback', { code: code });
                        const { access_token } = response.data.data;
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
        } catch (error) {
            sendResponse({ status: "error", message: error.message });
        }
    };

    const handleFetchUserInfo = async () => {
        try {
            const accessToken = request.access_token;

            // Fetch user data using the access token
            const response = await apiClient.get('/auth/getUserData', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            console.log('User Data:', response.data);

            // Check if the user with this login already exists
            const checkLoginResponse = await apiClient.post('/users/getUserByLogin', {
                "login": response.data.data.login
            });

            const userExists = checkLoginResponse.data &&
                checkLoginResponse.data.success &&
                Object.keys(checkLoginResponse.data.data).length !== 0;

            if (userExists) {
                console.log('User already exists:', checkLoginResponse.data.data);
                // User exists, no need to register again
                sendResponse({ status: "success", userData: checkLoginResponse.data });
            } else {
                // Register the user because the login was not found
                const userInfo = await apiClient.post('/users/register', {
                    "name": response.data.data.name,
                    "email": response.data.data.notification_email,
                    "login": response.data.data.login
                });

                console.log('User registered:', userInfo.data);
                sendResponse({ status: "success", userData: userInfo.data });
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
            sendResponse({ status: "error", message: "Failed to retrieve user data" });
        }
    };



    const handleFetchRepositories = async () => {
        try {
            const accessToken = request.access_token;
            const response = await apiClient.get('/auth/getUserRepos', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            console.log('User Repositories:', response.data);
            sendResponse({
                status: "success",
                message: "Repositories fetched successfully",
                repositories: response.data.data
            });
        } catch (error) {
            console.error('Error fetching repositories:', error);
            sendResponse({
                status: "error",
                message: "Failed to retrieve repositories",
                error: error.response ? error.response.data : error.message
            });
        }
    };

    const handleAddCategory = async () => {
        try {
            const userId = request.userId;
            const categoryName = request.categoryName;

            const response = await apiClient.post('/users/addCategory', {
                "userId": userId,
                "category": categoryName
            });
            sendResponse({ status: "success", message: "Category added successfully", data: response.data });
        } catch (error) {
            console.error('Error adding category:', error);
            sendResponse({ status: "error", message: "Failed to add category" });
        }
    };

    const handleUpdateCategory = async () => {
        try {
            const userId = request.userId;
            const categoryId = request.categoryId;
            const categoryName = request.categoryName;
            console.log(categoryId);

            const response = await apiClient.patch('/users/updateCategoryName', {
                userId: userId,
                categoryId: categoryId,
                newCategoryName: categoryName
            })

            sendResponse({ status: "success", message: "Category updated successfully", data: response.data });
        } catch (error) {
            console.error('Error updating category:', error);
            sendResponse({ status: "error", message: "Failed to update category" });
        }
    };

    const handleGetCategory = async () => {
        try {
            const userId = request.userId;

            const response = await apiClient.get(`/users/getCategories?userId=${userId}`);
            sendResponse({ status: "success", message: "Category updated successfully", data: response.data });

        }
        catch (error) {
            console.error('Error getting category:', error);
            sendResponse({ status: "error", message: "Failed to retrieve category" });
        }
    };

    const handleDeleteCategory = async () => {
        try {
            const userId = request.userId;
            const categoryId = request.categoryId;

            console.log(userId, categoryId);

            const response = await apiClient.delete(`/users/deleteCategory`, {
                params: {
                    userId: userId,
                    categoryId: categoryId
                }
            });
            sendResponse({ status: "success", message: "Category deleted successfully", data: response.data });
        }
        catch (error) {
            console.error('Error deleting category:', error);
            sendResponse({ status: "error", message: "Failed to delete category" });
        }
    };

    const handleUpdateRepository = async () => {
        try {
            const userId = request.userId;
            const categoryId = request.categoryId;
            const action = request.repoAction;
            const repository = request.repository;


            const response = await apiClient.patch('/users/updateCategoryRepos', {
                userId: userId,
                categoryId: categoryId,
                action: action,
                repos: repository
            });

            sendResponse({ status: "success", message: "Repository Added successfully", data: response.data });

        }
        catch (error) {
            console.error('Error updating repository:', error);
            sendResponse({ status: "error", message: "Failed to update repository" });
        }

    }

    // Dispatch request actions to appropriate handlers
    switch (request.action) {
        case "authenticate":
            handleAuthenticate();
            return true; // Indicate async operation
        case "fetchUserInfo":
            handleFetchUserInfo();
            return true; // Indicate async operation
        case "fetchRepositories":
            handleFetchRepositories();
            return true; // Indicate async operation
        case "addCategory":
            handleAddCategory();
            return true; // Indicate async operation
        case "updateCategory":
            handleUpdateCategory();
            return true;
        case "fetchCategories":
            handleGetCategory();
            return true;
        case "deleteCategory":
            handleDeleteCategory();
            return true;
        case "updateRepository":
            handleUpdateRepository();
            return true;
        default:
            console.warn("Unknown action:", request.action);
            sendResponse({ status: "error", message: "Unknown action" });
    }
});

chrome.runtime.onInstalled.addListener(() => {
    console.log('Service Worker registered successfully');
    // Set an alarm to keep the service worker alive if necessary
    chrome.alarms.create('keepAlive', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'keepAlive') {
        console.log('Keep-alive alarm triggered');
    }
});
