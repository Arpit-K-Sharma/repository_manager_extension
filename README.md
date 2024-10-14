# GitHub Repository Manager

#### Video Demo: <URL HERE>

#### Description:

## Project Overview

The **GitHub Repository Manager** is a Chrome extension designed to help users manage and categorize their GitHub repositories efficiently. This project integrates seamlessly with the GitHub API and a custom backend built with Express.js, allowing users to authenticate their GitHub accounts, fetch their repositories, and organize them into custom categories. The extension provides a user-friendly interface where users can view their repositories, categorize them, and perform CRUD operations on categories and repositories.

The backend for this project has been deployed on Render, ensuring that the API is accessible and operational for users of the extension.

This README serves as a comprehensive guide to the project's structure, functionality, and design choices.

## Project Structure

The project is organized into several key components:

- **manifest.json**: The configuration file for the Chrome extension, specifying essential metadata, permissions, and background scripts. It defines the extension's name, version, description, icons, and the permissions required to access various APIs and resources.

- **src/background.js**: This is the service worker that handles background tasks for the extension. It listens for messages from the popup and performs actions such as authentication, fetching user information, and managing categories and repositories.

- **src/index.js**: The entry point for the React application, which serves as the user interface for the extension's popup. This file is responsible for rendering the components and managing the application's state.

- **public/index.html**: The HTML template for the popup, where the React application is injected.

- **webpack.config.js**: The configuration file for Webpack, which bundles the JavaScript and CSS files for the extension. It specifies entry points, output settings, module rules, and plugins used in the build process.

- **.env**: A file used to store environment variables, such as the GitHub client ID and secret. This file is crucial for maintaining sensitive information and ensuring a smooth integration with external APIs.

## API Calls Overview

The backend, built with Express.js and deployed on Render, exposes several endpoints that the Chrome extension interacts with. Below is a summary of each API call and the data it returns:

1.  **POST /auth/github/callback**:
    This endpoint receives an authorization code from GitHub after user authentication. It exchanges the code for an access token, which is returned in the response. This access token is essential for making authenticated requests to the GitHub API on behalf of the user.

    **Response Example**:

    ```json
    {
      "data": {
        "access_token": "YOUR_ACCESS_TOKEN"
      }
    }
    ```

2.  **GET /auth/getUserData**:
    This endpoint fetches user data from GitHub using the provided access token. It returns details such as the user's name, email, and GitHub login.

    **Response Example**:

    ```json
    {
      "data": {
        "login": "username",
        "name": "User Name",
        "notification_email": "user@example.com"
      }
    }
    ```

3.  **POST /users/getUserByLogin**:
    This endpoint checks if a user with the given GitHub login already exists in the database. It helps avoid duplicate registrations.

        **Response Example**:

    ```json
    {
      "success": true,
      "data": {
        // user data if exists
      }
    }
    ```

4.  **POST /users/register**:
    If the user does not exist, this endpoint registers a new user in the database using the data fetched from GitHub.

    **Response Example**:

    ```json
    {
      "success": true,
      "data": {
        // newly registered user data
      }
    }
    ```

5.  **GET /auth/getUserRepos**:
    This endpoint retrieves all repositories owned by the authenticated user using the access token. It returns a list of repositories with relevant details.

    **Response Example**:

    ```json
    {
      "data": [
        {
          "id": 12345,
          "name": "repo-name",
          "url": "https://github.com/user/repo-name"
        }
        // more repositories
      ]
    }
    ```

6.  **POST /users/addCategory**:
    This endpoint adds a new category for the user, allowing them to organize their repositories.

    **Response Example**:

    ```json
    {
      "success": true,
      "data": {
        "categoryId": "new_category_id"
      }
    }
    ```

7.  **PATCH /users/updateCategoryName**:
    This endpoint updates the name of an existing category.

    **Response Example**:

    ```json
    {
      "success": true,
      "data": {
        // updated category data
      }
    }
    ```

8.  **GET /users/getCategories**:
    This endpoint retrieves all categories associated with a user.

    **Response Example**:

    ```json
    {
      "success": true,
      "data": [
        {
          "id": "category_id",
          "name": "Category Name"
        }
        // more categories
      ]
    }
    ```

9.  **DELETE /users/deleteCategory**:
    This endpoint deletes a specific category associated with a user.

    **Response Example**:

    ```json
    {
      "success": true,
      "data": {
        // confirmation of deletion
      }
    }
    ```

10. **PATCH /users/updateCategoryRepos**:
    This endpoint updates the repositories associated with a specific category, allowing users to add or remove repositories.

    **Response Example**:


    ```json
    {
     "success": true,
    "data": {
        // updated category with repositories
    }
    }
    ```

## Design Choices

Throughout the development of this extension, several design choices were made to ensure optimal performance and usability. The decision to use React for the frontend was driven by the need for a responsive and interactive user interface. React's component-based architecture allowed for reusable components and easier state management.

The choice of using Express.js for the backend was based on its simplicity and flexibility, enabling the rapid development of RESTful APIs. Additionally, utilizing async/await syntax for handling asynchronous operations in API calls contributed to cleaner and more maintainable code.

Furthermore, the implementation of a structured API endpoint system was crucial for maintaining clear separation between authentication, user management, and repository operations. This modular approach allows for easier future enhancements and debugging.

In conclusion, the GitHub Repository Manager is a powerful tool that enhances the user experience when managing GitHub repositories. Its integration with both the GitHub API and a custom backend ensures that users have a seamless experience. With a clear structure and well-defined functionalities, this project serves as a comprehensive solution for organizing and categorizing GitHub repositories effectively.
