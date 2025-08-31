/**
 * Configuration utility for API URLs and environment variables
 */

// Server-side API URL (for internal container communication)
export const getServerApiUrl = () => {
  return process.env.API_BASE_URL || 'http://app:8000';
};

// Client-side API URL (for browser requests)
export const getClientApiUrl = () => {
  // In production, use relative URL if NEXT_PUBLIC_API_URL is not set
  // This allows Traefik to route API requests to the correct backend service
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    // Use relative URL in production, localhost in development
    return process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';
  }
  return apiUrl;
};

// Determine the appropriate API URL based on environment (SSR vs CSR)
export const getApiUrl = () => {
  if (typeof window === 'undefined') {
    // Server-side: use internal container URL
    return getServerApiUrl();
  } else {
    // Client-side: use public URL
    return getClientApiUrl();
  }
};

// Get API URL with /api path
export const getApiEndpoint = (path?: string) => {
  const baseUrl = getApiUrl();
  const apiPath = path ? `/api/${path.replace(/^\//, '')}` : '/api';
  return `${baseUrl}${apiPath}`;
};

export const config = {
  apiUrl: getApiUrl(),
  serverApiUrl: getServerApiUrl(),
  clientApiUrl: getClientApiUrl(),
  apiEndpoint: getApiEndpoint(),
};
