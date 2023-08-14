const express = require("express");
require("dotenv").config();
const cors = require("cors");
const colors = require("colors");
const connectDB  = require('./configs/db')

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', require('./routes/mpesa.route'))

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`app is running on localhost:${port}`.rainbow.underline);
});

