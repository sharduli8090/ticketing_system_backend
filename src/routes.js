import { body, param } from "express-validator";
import { TestController } from "./controller/test/TestController.js";

export const Routes = [
  {
    method: "get",
    route: "/",
    controller: TestController,
    action: "all",
    validation: [],
  },
];
