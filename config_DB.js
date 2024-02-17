const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: '_USUARIO_BD_',
    password: '#_PASSWORD_DB_',
    database: 'datos_bd_node'
});

connection.connect((err) => {
    if (err) {
        console.error('Error al conectar a la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

module.exports = connection;
