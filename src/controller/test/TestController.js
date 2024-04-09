import { admindatacollection } from "../../config.js";

export class TestController { 
  async one(request, response, next) {
    try { 
      
      response.json({ statuscode: 200, message: "Test Connection Successfull" ,data: "No data"});
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
