// Configuration for deployed environment
const API_CONFIG = {
  // Your Hugging Face Space URL
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

// Store the original fetch
const originalFetch = window.fetch;

// Override fetch globally
window.fetch = function(url, options = {}) {
  let finalUrl = url;
  
  // Convert relative URLs to absolute
  if (typeof url === 'string' && url.startsWith('/api/')) {
    finalUrl = `${API_CONFIG.BASE_URL}${url}`;
    console.log(`🔄 API Call Redirected: ${url} -> ${finalUrl}`);
    
    // Ensure options exist
    options = options || {};
    options.mode = 'cors';
    options.credentials = 'omit';
    
    // Set Content-Type for POST/PUT requests
    if (!options.headers) {
      options.headers = {};
    }
    if ((!options.headers['Content-Type'] || !options.headers['content-type']) && 
        (options.method === 'POST' || options.method === 'PUT')) {
      options.headers['Content-Type'] = 'application/json';
    }
  }
  
  console.log(`🚀 Making request to: ${finalUrl}`);
  return originalFetch.call(this, finalUrl, options)
    .then(response => {
      console.log(`✅ Response from ${finalUrl}:`, response.status);
      return response;
    })
    .catch(error => {
      console.error(`🚨 Fetch Error for ${finalUrl}:`, error);
      throw error;
    });
};

// Make API_CONFIG globally available
window.API_CONFIG = API_CONFIG;

console.log('✅ API Configuration loaded successfully!');
console.log('BASE_URL:', API_CONFIG.BASE_URL);
console.log('FIR_API:', API_CONFIG.FIR_API);
console.log('CHATBOT_API:', API_CONFIG.CHATBOT_API);
