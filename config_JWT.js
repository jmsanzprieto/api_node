const jwt = require('jsonwebtoken');
const secretKey = 'CLAVE_JWT'; // Clave secreta para firmar los tokens JWT


// Middleware de autenticación JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401); // No autorizado

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403); // Prohibido
        req.user = user;
        next(); // Continuar con la ejecución de la solicitud
    });
    
}
module.exports = {
    authenticateToken: authenticateToken,
    jwt: jwt,
    secretKey: secretKey
};
