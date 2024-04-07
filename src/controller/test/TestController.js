import { admindatacollection } from "../../config.js";

export class TestController {
  async all(request, response, next) {
    return { test: "Test Connection Successfull" };
  }
  async one(request, response, next) {
    try {
      // Retrieve all documents from the collection
      const data = await admindatacollection.find().toArray();
      console.log(data);
      // Return the fetched data as a JSON response
      response.json(data);
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
