# Deployment Instructions for Render.com

To deploy the VGotYou full-stack application to Render, follow these steps:

## 1. Prepare your Repository
Ensure your code is pushed to a GitHub, GitLab, or Bitbucket repository.

## 2. Create a Web Service on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your repository.
4. Configure the service:
   - **Name:** `vgotyou-app`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (or higher)

## 3. Set Environment Variables
In the **Environment** tab of your Render service, add the following variables:

| Key | Value | Description |
|-----|-------|-------------|
| `NODE_ENV` | `production` | Set to production mode |
| `PORT` | `3000` | The port the server will run on |
| `APP_URL` | `https://your-app-name.onrender.com` | Your deployed app URL |
| `CLIENT_URL` | `https://your-app-name.onrender.com` | Same as APP_URL |
| `FIREBASE_PROJECT_ID` | `your-project-id` | From your Firebase console |
| `FIREBASE_CLIENT_EMAIL` | `your-service-account-email` | From your Firebase service account JSON |
| `FIREBASE_PRIVATE_KEY` | `your-private-key` | From your Firebase service account JSON (ensure newlines are handled) |

*Note: For Firebase, it's recommended to use a Service Account for server-side operations. If you're using the client-side config, ensure `firebase-applet-config.json` is present or its values are set as env vars.*

## 4. CORS Configuration
The backend is configured to allow requests from `CLIENT_URL`. Ensure this matches your deployed Render URL.

## 5. Automatic Sitemap
The sitemap will be available at `https://your-app-name.onrender.com/sitemap.xml` and is generated dynamically.

## 6. Admin Panel
Access the admin panel at `https://your-app-name.onrender.com/admin`. Ensure you have the correct Firebase Auth permissions.
