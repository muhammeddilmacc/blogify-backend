export const corsMiddleware = (req, res, next) => {
    const allowedOrigins = [
        'https://alicendek-lkov.onrender.com',
        'http://localhost:3000',
        'http://localhost:3001',
    ];
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    if (req.method === 'OPTIONS') {
        res.status(200).json({});
        return;
    }
    next();
};
