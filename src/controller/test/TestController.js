export class TestController {
  async all(request, response, next) {
    return { test: "Test Connection Successfull" };
  }
}
