// Configuration for deployed environment
const API_CONFIG = {
  // Replace with your actual Hugging Face Space URL
  BASE_URL: 'https://huggingface.co/spaces/S2004/police-dashboard',
  
  get FIR_API() {
    return `${this.BASE_URL}/api/fir`;
  },
  
  get CHATBOT_API() {
    return `${this.BASE_URL}/api`;
  },
  
  get POLICE_API() {
    return `${this.BASE_URL}/api/police`;
  }
};

// Override fetch to use Hugging Face URL
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // Convert relative URLs to absolute
  if (url.startsWith('/api/')) {
    const baseUrl = API_CONFIG.BASE_URL;
    url = `${baseUrl}${url}`;
    
    // Add CORS headers if needed
    options = options || {};
    options.mode = 'cors';
    options.credentials = 'omit';
    
    // Ensure headers exist
    if (!options.headers) {
      options.headers = {};
    }
    options.headers['Content-Type'] = 'application/json';
  }
  return originalFetch.call(this, url, options);
};

console.log('✅ API Configuration loaded:', API_CONFIG.BASE_URL);
