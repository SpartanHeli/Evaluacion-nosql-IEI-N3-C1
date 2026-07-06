require('dotenv').config();
const express = require('express'); // Librería que permite generar servidores JS
const cors = require('cors'); // Permite la ejecución de scripts entre máquinas distintas (cliente - servidor)
const mongoose = require('mongoose'); // ORM para trabajar con express (Object Relatonal Mapping)
const bcrypt = require('bcryptjs'); // Librería para encriptar contraseñas
const dns = require("node:dns/promises");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

dns.setServers(["1.1.1.1"]);

const uri = process.env.URI

// Crear la conexion con MongoDB
mongoose.connect(uri)
    .then(() => console.log('Conexión Exitosa!'))
    .catch((err) => console.error('Error al conectar a la DB: ', err));

// Chequeamos el puerto en el que efectivamente está corriendo la app
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

const comuna = new mongoose.Schema(
    {
        codigo_comuna: String,
        nombre_comuna: String,
        nombre_provincia: String,
        nombre_region: String      
    }
);

const direccion = new mongoose.Schema({
    comuna: String,
    calle: String,
    numero: String,
    departamento: String
});

// Creamos la ENTIDAD/MODELO en mongoose (ORM)
const usuario = new mongoose.Schema({
    nombre: String,
    rut: String,
    email: String,
    telefono: String,
    genero: String,
    fechaNacimiento: Date,
    contrasena: String,
    nacionalidad: String,
    genero: {
        type: String,
        enum: ['Masculino', 'Femenino', 'Otros'],
        default: 'Otros'
    },
    habilitado: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    direccion: [direccion]
});

const pais = new mongoose.Schema({
    nombre: String,
    nacionalidad: String,
    iso_2: String
})

const CuentaBancaria = new mongoose.Schema({
    usuario: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    banco: String,
    tipoCuenta: String,
    numeroCuenta: String,
    moneda: String,
    saldo: Number,
    fechaApertura: Date,
    estado: {
        type: String,
        enum: ['activa', 'bloqueada', 'cerrada'],
        default: 'activa'
    },
    sucursal: String,
    titular: String
});

// Creamos el OBJETO en mongoose, usando el MODELO como patrón/base
const Usuario = mongoose.model('Usuario', usuario, 'usuarios');

const Pais = mongoose.model('Pais', pais, 'paises');

const CuentaBancariaModel = mongoose.model('CuentaBancaria', CuentaBancaria, 'cuentas_bancarias');

const Comuna = mongoose.model('Comuna', comuna, 'comunas');

// Crear el ENDPOINT para recibir los datos de usuario
app.post('/guardarUsuario', async (req, res) => {
    try {
        // Leemos la data desde el BODY (cuerpo) de la REQUEST (solicitud)
        const { nombre, rut, email, genero, fechaNacimiento, contrasena, nacionalidad, direccion } = req.body;
        const direccionUsuario = JSON.parse(direccion);

        const salt = bcrypt.genSaltSync(10);
        const contrasenaEncriptada = bcrypt.hashSync(contrasena, salt);
        // Instanciamos el OBJETO Usuario con los valores obtenidos desde la REQUEST
        const nuevoUsuario = new Usuario({ nombre, rut, email, genero, fechaNacimiento, contrasena: contrasenaEncriptada, nacionalidad, direccion: direccionUsuario });

        // Le indicamos al ORM que debe PERSISTIR ese OBJETO
        await nuevoUsuario.save();
        res.status(200).json({ message: 'Datos Guardados correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar los datos: ', err });
    }
});

// Crear el ENDPOINT para leer los datos de usuario
app.get('/obtenerUsuarios', async (req, res) => {
    try {
        // Obtenemos una lista de usuarios desde DB
        const usuarios = await Usuario.aggregate([{ // Colección principal desde la que queremos obtener datos
            $lookup: {
                from: 'paises', // Colección que contiene los datos que queremos agregar
                localField: 'nacionalidad', // Campo de la colección principal que tiene la data relacionada
                foreignField: 'iso2', // Campo en la colección agregada que tiene el dato real
                as: 'paisOrigen' // Alias o nombre que le daremos a la agregación
            }
        }]);

        res.status(200).json(usuarios);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los datos: ', err });
    }
});

app.post('/guardarCuentaBancaria', async (req, res) => {
    try {
        // Leemos la data desde el BODY (cuerpo) de la REQUEST (solicitud)
        const { Usuario, banco, tipoCuenta, numeroCuenta, moneda, saldo, fechaApertura, sucursal, titular } = req.body;

        // Instanciamos el OBJETO CuentaBancaria con los valores obtenidos desde la REQUEST
        const nuevaCuenta = new CuentaBancariaModel({
            usuario,
            banco,
            tipoCuenta,
            numeroCuenta,
            moneda,
            saldo,
            fechaApertura,
            sucursal,
            titular
        });
        // Le indicamos al ORM que debe PERSISTIR ese OBJETO
        await nuevaCuenta.save();
        res.status(200).json({ message: 'Datos Guardados correctamente.' });
    } catch (err) {
        res.status(500).json({ message: 'Error al guardar los datos: ', err });
    }
});

app.get('/obtenerCuentasBancarias', async (req, res) => {
    try {

        const cuentas = await CuentaBancariaModel.aggregate([
            {
                $lookup: {
                    from: 'usuarios',
                    localField: 'usuario',
                    foreignField: '_id',
                    as: 'usuarioInfo'
                }
            }
        ]);

        res.status(200).json(cuentas);

    } catch (err) {

        res.status(500).json({
            message: 'Error al obtener los datos.',
            err
        });

    }
});

// Crear el ENDPOINT para leer los datos de paises
app.get('/obtenerPaises', async (req, res) => {
    try {
        // Obtenemos una lista de paises desde DB
        const paises = await Pais.find();
        res.status(200).json(paises);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los datos: ', err });
    }
});

app.get('/obtenerComunas', async (req, res) => {
    try {
        // Obtenemos una lista de comunas desde DB
        const comunas = await Comuna.find();
        res.status(200).json(comunas);
    } catch (err) {
        res.status(500).json({ message: 'Error al obtener los datos: ', err });
    }
});