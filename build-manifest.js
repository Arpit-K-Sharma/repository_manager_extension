const fs = require("fs");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Read the template manifest file
const manifestTemplate = fs.readFileSync(
    "public/manifest.template.json",
    "utf8"
);

// Replace placeholders with actual environment variable values
const manifest = manifestTemplate.replace(
    "__GITHUB_CLIENT_ID__",
    process.env.REACT_APP_CLIENT_ID
);

// Write the final manifest to the public directory
fs.writeFileSync("public/manifest.json", manifest);

console.log("manifest.json created successfully");
