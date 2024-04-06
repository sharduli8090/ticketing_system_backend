import { body, param } from "express-validator";
import { TestController } from "./controller/test/TestController.js";

export const Routes = [
    {
      method: "get",
      route: "/",
      auth: false,
      controller: TestController,
      action: "all",
      validation: [],
    },
    {
      method: "get",
      route: "/mongodbtest",
      auth: false,
      controller: TestController,
      action: "one",
      validation: [],
    },
];
