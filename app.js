const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const https = require("https");
const fs = require("fs");
require('dotenv/config');
const adminroute = require('./routes/admin');
const employroute = require('./routes/employ');

process.env.TZ= "Asia/Calcutta";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

// ap.use("///", function);

// employ informations databse
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("Database connected!"))
  .catch(err => console.log(err));

app.listen(5000);

// const options = {
//   key: fs.readFileSync('/etc/letsencrypt/live/enisolution.com/privkey.pem', 'utf8'),
//   cert: fs.readFileSync('/etc/letsencrypt/live/enisolution.com/cert.pem', 'utf8'),
// };

// https.createServer(options, app)
// .listen(5000, function (req, res) {
//   console.log("Server started at port 5000");
// });


app.get('/', (req, res)=>{
    res.send("We are on home");
});

app.use('/admin', adminroute);
app.use('/employ', employroute);