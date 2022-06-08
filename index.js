const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// heroku deploy link
// https://fathomless-hamlet-80982.herokuapp.com/

// GET MAIN
app.get('/', (req, res) => {
    res.send('Phone Garage Server Running!')
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@phonegagate.m6mbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {

    const verifyJWT = (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).send({ message: 'unauthorize access' })
        }
        const token = authHeader.split(' ')[1];
        jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).send({ message: 'forbidden access' })
            }
            req.decoded = decoded;
            next();
        });
    }

    try {
        await client.connect();
        const phoneCollection = client.db("phoneGarage").collection("phone");

        // JWT POST
        app.post('/login', (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.JWT_TOKEN_SECRET, {
                expiresIn: '1d'
            })
            res.send({ accessToken })
        });

        // GET ALL PRODUCT
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = phoneCollection.find(query);
            const phone = await cursor.toArray();
            res.send(phone);
        });

        // GET SINGLE SEARCH QUERY
        app.get('/items', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email };
                const cursor = phoneCollection.find(query);
                const items = await cursor.toArray();
                res.send(items);
            }
            else {
                res.status(403).send({ message: 'forbidden access' })
            }
        });

        // GET SINGLE SEARCH ID
        app.get('/product/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const param = { _id: ObjectId(id) };
            const phoneId = await phoneCollection.findOne(param);
            res.send(phoneId);
        });

        // DELETE SINGLE MANAGE PRODUCT
        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const singlePhoneDelete = await phoneCollection.deleteOne(query);
            res.send(singlePhoneDelete);
        });

        // POST ADD NEW ITEM
        app.post('/product', async (req, res) => {
            const newPost = req.body;
            const result = await phoneCollection.insertOne(newPost);
            res.send(result);
        });

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

// LISTEN MAIN
app.listen(port, () => {
    console.log(`Phone Garage Server Running! ${port}`)
});