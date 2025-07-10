// Simple health check endpoint
module.exports = async (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'LexiBot API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
};