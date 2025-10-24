// Debug script to check API configuration
console.log('🔍 Debug: Checking API Configuration...');
console.log('Current BASE_URL:', window.API_CONFIG?.BASE_URL);
console.log('Window location:', window.location.hostname);

// Test the fetch override
console.log('Testing fetch override...');
const testUrl = '/api/health';
console.log('Original URL:', testUrl);

// Simulate what happens in our override
const baseUrl = 'https://s2004-police-dashboard.hf.space';
const finalUrl = `${baseUrl}${testUrl}`;
console.log('Final URL should be:', finalUrl);
