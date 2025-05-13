const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5036', // Backend server URL
      changeOrigin: true,
      secure: false,
      pathRewrite: {
        '^/api': '/api', // Keep the /api prefix
      },
      onProxyReq: (proxyReq, req, res) => {
        // Log outgoing request
        console.log('Proxying request to:', proxyReq.path);
      },
      onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
      },
    })
  );
};