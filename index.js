const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// heroku deploy link
// https://fathomless-hamlet-80982.herokuapp.com/

// GET Main
app.get('/', (req, res) => {
    res.send('Phone Garage Client Running!')
})

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorize access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_TOKEN, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@phonegagate.m6mbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const phoneCollection = client.db("phoneGarage").collection("phone");

        // JWT POST
        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JWT_TOKEN, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        })

        // GET ALL PRODUCT
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = phoneCollection.find(query);
            const phone = await cursor.toArray();
            res.send(phone);
        })

        // GET SINGLE SEARCH QUERY
        app.get('/product', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded?.email;
            const email = req.query?.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = phoneCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
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
        })

        // POST ADD NEW ITEM
        app.post('/product', async (req, res) => {
            const newPost = req.body;
            const result = await phoneCollection.insertOne(newPost);
            res.send(result);
        })

    } finally {

    }
}
run().catch(console.dir);

// LISTEN Main
app.listen(port, () => {
    console.log('Phone Garage Server Running!');
})
