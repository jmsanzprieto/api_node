// Importa el módulo express y lo asigna a la constante express
const express = require('express');
// Inicializa una instancia de la aplicación express
const app = express();
// Define el puerto en el que se ejecutará el servidor, tomando el valor del entorno si está definido, de lo contrario utiliza el puerto 3000
const PORT = process.env.PORT || 3000;
// Importa la configuración de la conexión a la base de datos
const connection = require('./config_DB');
// Importa funciones y constantes relacionadas con la autenticación JWT
const { authenticateToken, jwt, secretKey } = require('./config_JWT');

// Middleware para parsear el cuerpo de las solicitudes POST como objetos JSON
app.use(express.json());

// Ruta para leer y mostrar los datos de la tabla usuarios
// El middleware authenticateToken verifica si el token JWT en la solicitud es válido antes de permitir el acceso a esta ruta
app.get('/usuarios', authenticateToken, (req, res) => {
    // Consulta todos los usuarios en la base de datos
    connection.query('SELECT * FROM datos_usuarios', (error, results) => {
        if (error) {
            // En caso de error en la consulta, envía una respuesta de error al cliente
            console.error('Error al realizar la consulta:', error);
            return res.status(500).send('Error interno del servidor');
        }
        // Envia los resultados de la consulta como respuesta al cliente en formato JSON
        res.json(results);
    });
});

// Ruta para ver los datos de un usuario por su ID
// Esta ruta también utiliza el middleware authenticateToken para verificar la autenticación del usuario
app.get('/usuarios/:id_usuario', authenticateToken, (req, res) => {
    // Obtiene el ID del usuario de los parámetros de la solicitud
    const usuarioId = req.params.id_usuario;
    // Consulta los datos del usuario con el ID proporcionado en la tabla usuarios
    connection.query('SELECT * FROM datos_usuarios WHERE id_usuario = ?', usuarioId, (error, results) => {
        if (error) {
            console.error('Error al obtener los datos del usuario:', error);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            // Si no se encuentran resultados, envía una respuesta de usuario no encontrado al cliente
            return res.status(404).send('Usuario no encontrado');
        }
        // Envía los datos del usuario encontrado como respuesta al cliente en formato JSON
        res.json(results[0]);
    });
});

// Ruta para añadir un nuevo usuario a la tabla usuarios
// También utiliza el middleware authenticateToken para verificar la autenticación del usuario
app.post('/usuarios', authenticateToken, (req, res) => {
    // Obtiene los datos del nuevo usuario del cuerpo de la solicitud
    const nuevoUsuario = req.body;
    // Inserta el nuevo usuario en la base de datos
    connection.query('INSERT INTO datos_usuarios SET ?', nuevoUsuario, (error, results) => {
        if (error) {
            console.error('Error al insertar un nuevo usuario:', error);
            return res.status(500).send('Error interno del servidor');
        }
        // Envía una respuesta de éxito al cliente
        res.status(201).send('Usuario añadido correctamente');
    });
});

// Ruta para actualizar un usuario existente por su ID
// Utiliza el middleware authenticateToken para verificar la autenticación del usuario
app.put('/usuarios/:id_usuario', authenticateToken, (req, res) => {
    // Obtiene el ID del usuario a actualizar de los parámetros de la solicitud
    const usuarioId = req.params.id_usuario;
    // Obtiene los datos actualizados del cuerpo de la solicitud
    const datosActualizados = req.body;
    // Actualiza los datos del usuario en la base de datos
    connection.query('UPDATE datos_usuarios SET ? WHERE id_usuario = ?', [datosActualizados, usuarioId], (error, results) => {
        if (error) {
            console.error('Error al actualizar el usuario:', error);
            return res.status(500).send('Error interno del servidor');
        }
        // Envía una respuesta de éxito al cliente
        res.send('Usuario actualizado correctamente');
    });
});

// Ruta para borrar un usuario existente por su ID
// Utiliza el middleware authenticateToken para verificar la autenticación del usuario
app.delete('/usuarios/:id_usuario', authenticateToken, (req, res) => {
    // Obtiene el ID del usuario a eliminar de los parámetros de la solicitud
    const usuarioId = req.params.id_usuario;
    // Elimina el usuario de la base de datos
    connection.query('DELETE FROM datos_usuarios WHERE id_usuario = ?', usuarioId, (error, results) => {
        if (error) {
            console.error('Error al eliminar el usuario:', error);
            return res.status(500).send('Error interno del servidor');
        }
        // Envía una respuesta de éxito al cliente
        res.send('Usuario eliminado correctamente');
    });
});

// Ruta para autenticar un usuario y generar un token JWT
app.post('/login', (req, res) => {
    // Obtiene el nombre de usuario y la contraseña del cuerpo de la solicitud
    const { username, password } = req.body;
    // Verifica si el usuario existe en la base de datos y si la contraseña coincide
    connection.query('SELECT * FROM user WHERE username = ? AND password = ?', [username, password], (error, results) => {
        if (error) {
            console.error('Error al buscar usuario:', error);
            return res.status(500).send('Error interno del servidor');
        }
        if (results.length === 0) {
            // Si no se encuentra el usuario o la contraseña es incorrecta, envía una respuesta de credenciales incorrectas
            return res.status(401).json({ message: 'Credenciales incorrectas' });
        }
        // Si la autenticación es exitosa, genera un token JWT y lo envía al cliente como respuesta
        const token = jwt.sign({ username: username }, secretKey);
        res.json({ token: token });
    });
});

// Inicia el servidor y lo hace escuchar en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});
