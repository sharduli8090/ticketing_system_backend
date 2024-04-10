import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";

export const APP_PORT = process.env.PORT || 3000;

const uri = process.env.url; 

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let database = "";
let admindatacollection = "";
let employeedatacollection = "";
let ticketdatacollection = "";
let querydatacollection = "";

// Error handling function for a more robust approach
function handleError(error) {
  console.error("Error connecting to the database:", error);
  process.exit(1); // Exit the process on critical errors
}

async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    database = client.db("ticketing_system");
    admindatacollection = database.collection("admin_data"); 
    employeedatacollection = database.collection("employee");
    ticketdatacollection = database.collection("ticket");
    querydatacollection = database.collection("query");
    await client.db("ticketing_system").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    handleError(error);
  }
}

run().catch(console.dir);

export { database, admindatacollection, employeedatacollection, ticketdatacollection, querydatacollection};
