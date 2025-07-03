# Backend Setup Guide

## Quick Start

1. **Create Environment File**
   ```bash
   # Copy the template
   cp env.template .env
   ```

2. **Edit .env file**
   Replace the placeholder values with your actual credentials:
   ```env
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/your_database
   JWT_SECRET=your_super_secret_jwt_key_here
   FRONTEND_URL=https://your-vercel-app-name.vercel.app
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Start the Server**
   ```bash
   npm start
   ```

## MongoDB Setup

1. Create a MongoDB Atlas account at https://mongodb.com
2. Create a new cluster
3. Get your connection string from the "Connect" button
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with your database name

## Testing

Once the server is running, you can test:

- **Health Check**: http://localhost:5001/health
- **Rewards API**: http://localhost:5001/api/rewards
- **Customers API**: http://localhost:5001/api/customers

## Common Issues

**"MONGODB_URI environment variable is not set!"**
- Make sure you created the `.env` file
- Check that the file is in the backend directory
- Verify the MONGODB_URI format is correct

**"MongoDB connection failed"**
- Check your internet connection
- Verify your MongoDB Atlas cluster is running
- Make sure your IP address is whitelisted in MongoDB Atlas
- Check that your username and password are correct

**"Module not found" errors**
- Run `npm install` to install dependencies
- Make sure you're in the backend directory 