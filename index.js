const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.801m1.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("kids_island");
        const productsCollection = database.collection("products");
        const usersCollection = database.collection("users");
        const ordersCollection = database.collection("orders");
        const reviewCollection = database.collection("reviews");

        /* GET */
        // Get all the products
        app.get("/products", async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products);
        });

        // Get limited products for home page
        app.get("/home/products", async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.limit(6).toArray();
            res.json(products);
        });

        // Get a single product
        app.get("/products/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });

        // Check if the user is admin or not
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        // Get order by user
        app.get("/orders/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const orders = ordersCollection.find(query);
            const result = await orders.toArray();
            res.json(result);
        });

        // Get all reviews
        app.get("/reviews", async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews);
        });

        /* POST */

        // Post a new order
        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        // add new user from registration form
        app.post("/users", async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // Add a new product in the database
        app.post("/products", async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });

        // Add a review
        app.post("/reviews", async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });

        /* PUT OR UPDATE */

        // add new or old user from google login system
        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
        });

        // Add a new user as admin
        app.put("/users/admin", async (req, res) => {
            console.log("API hit");
            const userEmail = req.body.email;
            const filter = { email: userEmail };
            const updateDoc = { $set: { role: "admin" } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        /* DELETE */

        // Delete a order based on Id
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Kids Island server is running");
});

app.listen(port, () => {
    console.log("Kids Island server is running on:", port);
});
