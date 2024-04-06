import express from "express";
import bodyParser from "body-parser";
import { Routes } from "./routes.js";
import { validationResult } from "express-validator";

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
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

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
const port = 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
