// Configuration for API endpoints
export const config = {
  // Use environment variable for API base URL, required for production
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || (process.env.NODE_ENV === 'development' ? 'http://localhost:5001' : ''),
  
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};



// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${config.apiBaseUrl}/${cleanEndpoint}`;
  return fullUrl;
}; 