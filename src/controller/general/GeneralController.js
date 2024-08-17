import { querydatacollection } from "../../config.js";

export class GeneralController {
  async sendQueryFeedback(request, response, next) {
    try {
      let { name, query } = request.body;

      let id = shortid.generate();
      const data = await querydatacollection.insertOne({ id,name, query });
 
      response.json({
        statuscode: 200,
        message: "We've got your query/feedback. We'll be in touch soon!",
        data: data,
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
