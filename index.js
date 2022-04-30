const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors())
app.use(express.json())

// heroku deploy link
// https://fathomless-hamlet-80982.herokuapp.com/

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@phonegagate.m6mbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const phoneCollection = client.db("phoneGarage").collection("phone");

        // GET ALL 
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = phoneCollection.find(query);
            const phone = await cursor.toArray();
            res.send(phone);
        })

        // GET SINGLE SEARCH ID
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singlePhone = await phoneCollection.findOne(query);
            res.send(singlePhone);
        })

        // DELETE SINGLE MANAGE PRODUCT
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singlePhoneDelete = await phoneCollection.deleteOne(query);
            res.send(singlePhoneDelete);
            console.log(singlePhoneDelete);
        })

        // POST ADD NEW ITEM
        app.post('/product', async (req, res) => {
            const newPost = req.body;
            const result = await haiku.insertOne(newPost);
            res.send(result);
        })

    } finally {

    }
}
run().catch(console.dir);

// GET Main
app.get('/', (req, res) => {
    res.send('Phone Garage Client Running!')
})

// LISTEN Main
app.listen(port, () => {
    console.log('Phone Garage Server Running!');
})
