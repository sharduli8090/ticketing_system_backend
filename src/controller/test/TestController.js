export class TestController {
  async one(request, response, next) {
    try {
      response.json({
        statuscode: 200,
        message: "Connection successful!",
        data: "System check: All good in the hood!",
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
