const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
//---
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i4wg8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("Mens_Wallet");
    const ProductsCollection = database.collection("products");
    const orderedProductsCollection = database.collection("orderedProducts");
    const ReviewsCollection = database.collection("reviews");
    const UsersCollection = database.collection("users");

    // POST API add Product to database...
    app.post("/addProducts", async (req, res) => {
      const resort = req.body;
      const result = await ProductsCollection.insertOne(resort);
      res.json(result);
    });

    // GET API get all Products...
    app.get("/allProducts", async (req, res) => {
      const cursor = ProductsCollection.find({});
      const resorts = await cursor.toArray();
      res.json(resorts);
    });

    // DELETE API delete Product

    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await ProductsCollection.deleteOne(query);

      res.json(result);
    });

    // POST API  add   Product Order...

    app.post("/addOrder", async (req, res) => {
      const order = req.body;
      const result = await orderedProductsCollection.insertOne(order);

      res.json(result);
    });

    // POST API add Review
    app.post("/addReview", async (req, res) => {
      const review = req.body;
      const result = await ReviewsCollection.insertOne(review);

      res.json(result);
    });

    // GET API get all Review...
    app.get("/allReviews", async (req, res) => {
      const cursor = ReviewsCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    // GET API get all Ordered Products...
    app.get("/manageAllOrders", async (req, res) => {
      const cursor = orderedProductsCollection.find({});
      const result = await cursor.toArray();
      res.json(result);
    });

    // DELETE API   delete Order...
    app.delete("/deleteOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderedProductsCollection.deleteOne(query);

      res.json(result);
    });

    // GET API get only my Ordered  result...
    app.get("/myOrders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await orderedProductsCollection.find(query).toArray();
      res.json(result);
    });

    //UPDATE API Approve Orders...
    app.put("/approveOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const Booking = {
        $set: {
          status: "Approved",
        },
      };
      const result = await orderedProductsCollection.updateOne(query, Booking);
      res.json(result);
    });

    // POST API add user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await UsersCollection.insertOne(user);
      res.json(result);
    });
    //  PUT API  Make an Admin

    app.put("/makeAdmin", async (req, res) => {
      const filter = { email: req.body.email };
      const result = await UsersCollection.find(filter).toArray();
      if (result) {
        const documents = await UsersCollection.updateOne(filter, {
          $set: { role: "admin" },
        });

        res.json(documents);
      }
    });

    //  GET API  Check Admin or Not
    app.get("/checkAdmin/:email", async (req, res) => {
      const result = await UsersCollection.find({
        email: req.params.email,
      }).toArray();
      console.log(result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send(" Men's Wallet Server is Running");
});
app.listen(port, () => {
  console.log("listening to the port ", port);
});
