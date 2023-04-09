const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const path = require('path');

const apicache = require('apicache')

let cache = apicache.options({
  headers: {
    'cache-control': 'no-cache',
  },
  statusCodes:{
    include: [200, 201, 304]
  }
}).middleware

const collectionRouter = require('./routers/collectionRouter');
app.use(cache('1 hour'))

const AppError = require('./utils/appError');

// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
var whitelist = ['https://jpegraffles.xyz', 'https://www.jpegraffles.xyz', 'http://localhost:3000']
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
app.use(cors(corsOptions))
 
app.use(express.json());

// set security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


//  set limit request from same API in timePeroid from same ip
const limiter = rateLimit({
  max: 100, //   max number of limits
  windowMs: 60 * 60 * 1000, // hour
  message:
    ' Too many req from this IP , please Try  again in an Hour ! ',
});

app.use('/api', limiter);

//  Body Parser  => reading data from body into req.body protect from scraping etc
// app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSql query injection

// Data sanitization against XSS
app.use(xss()); //    protect from molision code coming from html

// testing middleware
// app.use((req, res, next) => {
//   console.log('this is a middleware');
//   next();
// });

// routes
app.use('/api/collections', collectionRouter);

// handling all (get,post,update,delete.....) unhandled routes
app.all('*', (req, res, next) => {
  next(
    new AppError(`Can't find ${req.originalUrl} on the server`, 404)
  );
});
module.exports = app;
