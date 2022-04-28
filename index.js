const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())

// GET Main
app.get('/', (req, res) => {
    res.send('Phone Garage Client Running!')
})

// LISTEN Main
app.listen(port, () => {
    console.log('Phone Garage Server Running!');
})
