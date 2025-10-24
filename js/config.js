// Configuration for deployed environment
const API_CONFIG = {
  // ✅ CORRECT: Use your Hugging Face Space URL (not profile URL)
  BASE_URL: 'https://s2004-police-dashboard.hf.space',
  
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

// Enhanced fetch override with better error handling
const originalFetch = window.fetch;
window.fetch = function(url, options = {}) {
  // Convert relative URLs to absolute
  if (url.startsWith('/api/')) {
    const baseUrl = API_CONFIG.BASE_URL;
    url = `${baseUrl}${url}`;
    
    console.log(`🔄 API Call: ${url}`);
    
    // Add CORS headers
    options = options || {};
    options.mode = 'cors';
    options.credentials = 'omit';
    
    // Ensure headers exist
    if (!options.headers) {
      options.headers = {};
    }
    if (!options.headers['Content-Type'] && (options.method === 'POST' || options.method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
    }
  }
  
  return originalFetch.call(this, url, options)
    .catch(error => {
      console.error('🚨 Fetch Error:', error);
      throw error;
    });
};

console.log('✅ API Configuration loaded. Base URL:', API_CONFIG.BASE_URL);
