const dotenv = require('dotenv').config();
const colors = require('colors');
process.on('uncaughtException', (error) => {
  // using uncaughtException event
  console.log(error)
  console.log(' uncaught Exception => shutting down..... ');
  console.log(error.name, error.message);
  process.exit(1); //  emidiatly exists all from all the requests
});

const app = require('./app');

const port = process.env.PORT || 3005;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}`.yellow.bold);
});

// handle Globaly  the unhandle Rejection Error which is  outside the express
// e.g database connection
process.on('unhandledRejection', (error) => {
  // it uses unhandledRejection event
  // using unhandledRejection event
  console.log(' Unhandled Rejection => shutting down..... ');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1); //  emidiatly exists all from all the requests sending OR pending
  });
});
