// ************ Require's ************
require('dotenv').config();
const createError = require('http-errors');
const cookieParser = require('cookie-parser');
const express = require('express');
const logger = require('morgan');
const path = require('path');

const methodOverride =  require('method-override'); // Pasar poder usar los métodos PUT y DELETE

const {cookieCheck} =require('./middlewares')

// ************ express() - (don't touch) ************
const app = express();

// ************ Middlewares - (don't touch) ************
app.use(express.static(path.join(__dirname, '../public')));  // Necesario para los archivos estáticos en el folder /public
app.use(express.urlencoded({ extended: false }));
app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser());

app.use(methodOverride('_method')); // Pasar poder pisar el method="POST" en el formulario por PUT y DELETE

app.use(cookieCheck);

// ************ Template Engine - (don't touch) ************
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views')); // Define la ubicación de la carpeta de las Vistas



// ************ WRITE YOUR CODE FROM HERE ************
// ************ Route System require and use() ************

app
  .use('/', require('./routes/main'))
  .use('/products', require('./routes/products'))
  .use('/users', require('./routes/users'))
  .use('/auth', require('./routes/auth'))



// ************ DON'T TOUCH FROM HERE ************
// ************ catch 404 and forward to error handler ************
app.use((req, res, next) => next(createError(404)));

// ************ error handler ************
app.use((err, req, res, next) => {

  return res.status(err.status || 500).json({
    ok : false,
    status : err.status || 500,
    error : 'Ruta no válida'
  });
});

// ************ exports app - dont'touch ************
module.exports = app;
