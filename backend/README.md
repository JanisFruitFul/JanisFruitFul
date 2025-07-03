# Backend Folder

This folder contains all backend-related code, including API routes, models, utilities, and scripts.

## Files Structure

- `server.js`: Main server entry point for deployment (e.g., Render).
- `cloudinary.js`: Cloudinary configuration and utilities.
- `lib/mongodb.ts`: MongoDB connection logic.
- `models/`: All MongoDB models (Admin, Customer, MenuItem, Shop).
- `scripts/seed-database.js`: Database seeding script.
- `utils/uploadImage.js`: Image upload utility for Cloudinary.

## Deployment

For Render deployment:
- **Build Command:** `pnpm install --frozen-lockfile && pnpm run build`
- **Start Command:** `node backend/server.js`

## Environment Variables

Make sure to set these environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `CLOUDINARY_CLOUD_NAME`: Your Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Your Cloudinary API key
- `CLOUDINARY_API_SECRET`: Your Cloudinary API secret 