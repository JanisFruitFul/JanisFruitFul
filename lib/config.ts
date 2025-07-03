// Configuration for API endpoints
export const config = {
  // Use environment variable for API base URL, fallback to localhost for development
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5050',
  
  // Environment detection
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};

// Debug logging
console.log('🔧 API Configuration:', {
  apiBaseUrl: config.apiBaseUrl,
  isDevelopment: config.isDevelopment,
  isProduction: config.isProduction,
  envVar: process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET'
});

// Helper function to get full API URL
export const getApiUrl = (endpoint: string) => {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const fullUrl = `${config.apiBaseUrl}/${cleanEndpoint}`;
  console.log('🌐 Generated API URL:', fullUrl);
  return fullUrl;
}; 