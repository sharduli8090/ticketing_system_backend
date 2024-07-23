import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { APP_PORT } from "./config.js";
import { Routes } from "./routes.js";

function handleError(err, req, res, next) {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({ message: err.message });
}

const app = express();
app.use(bodyParser.json());
app.use(cors());

Routes.forEach((route) => {
  app[route.method](
    route.route,
    ...route.validation,
    async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (route.auth && !token) {
        return next(new Error("Not authorized"));
      }

      if (route.auth) {
        let decodedToken;
        try {
          const secretKey =
            route.type === "employee"
              ? process.env.EMPSECRET
              : process.env.SECRET;
          decodedToken = jwt.verify(token, secretKey);
          if (
            !decodedToken.type ||
            (decodedToken.type !== "admin" && decodedToken.type !== "employee")
          ) {
            throw new Error("Invalid or unauthorized token");
          }
        } catch (error) {
          return next(new Error("Invalid token"));
        }

        if (decodedToken.type !== route.type) {
          return next(new Error("Forbidden: Access denied"));
        }

        req.user = decodedToken;
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new Error("Validation failed: " + errors.array()[0].msg));
      }

      try {
        const result = await new route.controller()[route.action](
          req,
          res,
          next
        );
        res.json(result);
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
