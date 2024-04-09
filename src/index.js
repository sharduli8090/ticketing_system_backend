import express from "express";
import bodyParser from "body-parser";
import { Routes } from "./routes.js";
import { validationResult } from "express-validator";
import { APP_PORT } from "./config.js";
import jwt from "jsonwebtoken";

function handleError(err, _req, res, _next) {
  res.status(err.statusCode || 500).send(err.message);
}

const app = express();
// app.use(morgan('tiny'));
app.use(bodyParser.json());

Routes.forEach((route) => {
  app[route.method](
    route.route,
    ...route.validation,
    async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (route.auth && !token) {
        next(new Error("Not authorized"));
        return;
      }
      if (route.auth && route.controller === "EmployeeController") {
        try {
          const decoded = jwt.verify(token, process.env.EMPSECRET);
          req.id = decoded.id;
        } catch (error) {
          next(error);
          return;
        }
      } else if (route.auth && route.controller === "AdminController") {
        try {
          const decoded = jwt.verify(token, process.env.SECRET);
          req.id = decoded.id;
        } catch (error) {
          next(error);
          return;
        }
      }

      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          next(new Error("Validation failed")); // Pass error for handling
          return;
        }

        const result = await new route.controller()[route.action](
          req,
          res,
          next
        );
      } catch (err) {
        next(err);
      }
    }
  );
});
app.use(handleError);

app.listen(APP_PORT, () => {
  console.log(`Server listening on port ${APP_PORT}`);
});
