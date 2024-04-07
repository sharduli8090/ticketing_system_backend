import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { employeedatacollection, ticketdatacollection } from "../../config.js";
import shortid from "shortid";

export class EmployeeController {
  async login(request, response, next) {
    try {
      const data = await employeedatacollection.findOne({
        email: request.body.email,
      });
      if (data) {
        const password = request.body.password;
        const isValidPassword = await argon2.verify(data.password, password);
        if (isValidPassword && data.email === request.body.email) {
          const token = jwt.sign({ id: data._id }, process.env.SECRET, {
            expiresIn: "1h",
          });
          response.json({
            statuscode: 200,
            id: data._id,
            message: "Login Successfull",
            token: token,
          });
          return;
        } else {
          response.json({ statuscode: 401, message: "Invalid Credentials" });
          return;
        }
      } else {
        response.json({ statuscode: 401, message: "Invalid Credentials" });
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async createTicket(request, response, next) {
    try {
      const { ticketName, ticketDescription, empId, empName } = request.body;
      if (!ticketName || !ticketDescription || !empId || !empName) {
        return response
          .status(400)
          .json({ message: "Missing required fields" });
      }
      const employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        return response.status(400).json({ message: "Employee not found" });
      }

      const id = shortid.generate();
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      const day = now.getDate();

      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const newTicket = {
        id,
        ticketName,
        ticketDescription,
        ticketRaisedById: empId,
        ticketRaisedByName: empName,
        ticketStatus: "open",
        dateOfCreation: formattedDate,
        dateOfCompletion: null,
        ticketComments: "",
      };
      const result = await ticketdatacollection.insertOne(newTicket);
      employee.empNoOfTicketsRaised += 1;
      employee.empTicketsRaisedIds.push(id);
      await employeedatacollection.updateOne({ id: empId }, { $set: employee });

      response
        .status(200)
        .json({ message: "Ticket created successfully", data: result });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async closeTicket(request, response, next) {
    try {
      const id = request.params.id;

      const data = await ticketdatacollection.findOne({ id });
      if (!data) {
        return response.status(404).json({ message: "Ticket not found" });
      }
      if (!request.body.empId) {
        return response
          .status(400)
          .json({ message: "Missing required fields" });
      }
      if (
        data.ticketStatus === "closed" ||
        data.ticketStatus === "approved" ||
        data.ticketStatus === "denied"
      ) {
        return response.status(400).json({ message: "Ticket already closed" });
      }
      if (data.ticketRaisedById !== request.body.empId) {
        return response
          .status(400)
          .json({ message: "You are not authorized to close this ticket" });
      }
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      const day = now.getDate();

      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const result = await ticketdatacollection.updateOne(
        { id: id },
        {
          $set: {
            ticketStatus: "closed",
            dateOfCompletion: formattedDate,
          },
        }
      );
      response
        .status(200)
        .json({ message: "Ticket closed successfully", data: result });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
