import { admindatacollection } from "../../config.js";

export class TestController { 
  async one(request, response, next) {
    try {
      // Retrieve all documents from the collection
      // const data = await admindatacollection.find().toArray();
      // console.log(data);
      // Return the fetched data as a JSON response
      response.json({ message: "Test Connection Successfull" });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
