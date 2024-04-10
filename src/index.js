import express from "express";
import bodyParser from "body-parser";
import { Routes } from "./routes.js";
import { validationResult } from "express-validator";
import { APP_PORT } from "./config.js";
import jwt from "jsonwebtoken"; // Assuming JWT is used for authentication

function handleError(err, req, res, next) {
  console.error(err.stack); // Log the error details for debugging
  res.status(err.statusCode || 500).json({ message: err.message }); // Send a more informative error response
}

const app = express();
app.use(bodyParser.json());

Routes.forEach((route) => {
  app[route.method](
    route.route,
    ...route.validation, // Apply any route-specific validation
    async (req, res, next) => {
      const token = req.headers.authorization?.split(" ")[1];
      if (route.auth && !token) {
        return next(new Error("Not authorized"));
      }

      if (route.auth) {
        let decodedToken, allowedController;
        try {
          const secretKey = route.controller === "EmployeeController"
            ? process.env.EMPSECRET // Use appropriate secret based on controller (if applicable)
            : process.env.SECRET;
          decodedToken = jwt.verify(token, secretKey);

          // **Enforce Token Type Check (assuming a 'type' property in payload):**
          if (!decodedToken.type || (decodedToken.type !== "admin" && decodedToken.type !== "employee")) {
            throw new Error("Invalid or unauthorized token");
          }

          allowedController = decodedToken.type === "admin" ? "AdminController" : "EmployeeController"; // Determine allowed controller based on token type
        } catch (error) {
          return next(new Error("Invalid token")); // Handle invalid tokens gracefully
        }

        // **Restrict Access Based on Token Type and Controller:**
        if (allowedController !== route.controller) {
          return next(new Error("Forbidden: Access denied")); // Handle unauthorized access attempts
        }

        req.user = decodedToken; // Attach decoded user information to the request object for further use
      }

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return next(new Error("Validation failed: " + errors.array()[0].msg)); // Provide specific validation error message(s)
      }

      try {
        const result = await new route.controller()[route.action](req, res, next);
        res.json(result); // Assume routes return a response object
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
