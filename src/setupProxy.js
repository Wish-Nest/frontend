const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
        '/api', // Le préfixe de chemin à intercepter dans votre front-end
        createProxyMiddleware({
            target: 'http://localhost:3001/api', // L'adresse de votre serveur backend
            changeOrigin: true, // Nécessaire pour les hôtes virtuels
        })
    );

    // Proxy pour servir les images uploadées depuis le backend en dev
    app.use(
        '/uploads',
        createProxyMiddleware({
            target: 'http://localhost:3001/uploads',
            changeOrigin: true,
        })
    );

    // Si vous avez d'autres cibles, vous pouvez en ajouter d'autres:
    // app.use(
    //   '/auth',
    //   createProxyMiddleware({
    //     target: 'http://autre-service:6000',
    //     changeOrigin: true
    //   })
    // );
};