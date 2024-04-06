import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';


export const APP_PORT = process.env.PORT || 3000; 


const uri = "mongodb+srv://shardulipandey8090:kS8fe6t7Otu9wlvx@cluster-ticketing.ksgiaj8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster-Ticketing";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("ticketing_system").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
