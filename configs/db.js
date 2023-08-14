const mongoose = require('mongoose')

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected Successfully: ${conn.connection.host}`.cyan.bold.underline)
    } catch (error) {
        console.error(`Error: ${error.message}`.bgRed.bold)
        process.exit(1);
    }
}

module.exports = connectDB;