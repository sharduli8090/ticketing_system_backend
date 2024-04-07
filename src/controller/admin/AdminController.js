import {
  admindatacollection,
  employeedatacollection,
  ticketdatacollection,
} from "../../config.js";
import shortid from "shortid";
import jwt from "jsonwebtoken";

import argon2 from "argon2";

export class AdminController {
  async login(request, response, next) {
    try {
      const data = await admindatacollection.findOne();
      const password = request.body.password;
      // const isValidPassword = await argon2.verify(data.password, password);
      console.log(data);
      console.log(request.body.email);
      console.log(password);
      if (
        data &&
        data.email === request.body.email &&
        data.password === password
      ) {
        const token = jwt.sign({ id: data._id }, process.env.SECRET, {
          expiresIn: "1h",
        });
        response.status(200).json({
          id: data._id,
          message: "Login Successfull",
          token: token,
        });
        return;
      } else {
        response.json({ statuscode: 401, message: "Invalid Credentials" });
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async createEmployee(request, response, next) {
    try {
      const {
        email,
        password,
        empName,
        empPosition,
        empGender,
        empDateOfBirth,
      } = request.body;
      if (!email || !password || !empName || !empPosition || !empDateOfBirth) {
        return response
          .status(400)
          .json({ message: "Missing required fields" });
      }
      const existingEmployee = await employeedatacollection.findOne({ email });
      if (existingEmployee) {
        return response
          .status(400)
          .json({ message: "Employee with this email already exists" });
      }
      const id = shortid.generate();
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      const day = now.getDate();

      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      // console.log(formattedDate); // Output: YYYY-MM-DD format
      const empDateOfJoining = formattedDate;
      // console.log(empDateOfJoining);
      const empNoOfTicketsRaised = 0;
      const empTicketsRaisedIds = [];
      const hashedpassword = await argon2.hash(password);
      const data = await employeedatacollection.insertOne({
        id,
        email,
        password: hashedpassword,
        empName,
        empPosition,
        empGender,
        empDateOfBirth,
        empDateOfJoining,
        empNoOfTicketsRaised,
        empTicketsRaisedIds,
      });
      response.status(200).json({
        message: "Employee Created Successfully",
        id: id,
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getAllEmployee(request, response, next) {
    try {
      const data = await employeedatacollection.find().toArray();
      const filteredData = data.map((employee) => {
        delete employee.password; // Remove password using delete
        return employee;
      });
      response
        .status(200)
        .json({ message: "All Employees", data: filteredData });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async deleteAllEmployee(request, response, next) {
    try {
      const data = await employeedatacollection.deleteMany();
      await ticketdatacollection.deleteMany();
      response
        .status(200)
        .json({ message: "All Employees Deleted", data: data });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async deleteEmployee(request, response, next) {
    try {
      let data = await employeedatacollection.findOne({
        id: request.params.id,
      });
      const ticketIds = data.empTicketsRaisedIds;
      console.log(ticketIds);
      await ticketdatacollection.deleteMany({ id: { $in: ticketIds } });
      data = await employeedatacollection.deleteOne({ id: request.params.id });
      response.status(200).json({ message: "Employee Deleted", data: data });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getAllTicket(request, response, next) {
    try {
      const data = await ticketdatacollection.find().toArray();
      response.status(200).json({ message: "All Tickets", data: data });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async deleteAllTicket(request, response, next) {
    try {
      const data = await ticketdatacollection.deleteMany();
      const employeeData = await employeedatacollection.find().toArray();
      employeeData.forEach(async (employee) => {
        await employeedatacollection.updateOne(
          { id: employee.id },
          {
            $set: {
              empNoOfTicketsRaised: 0,
              empTicketsRaisedIds: [],
            },
          }
        );
      });
      response.status(200).json({ message: "All Tickets Deleted", data: data });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async deleteTicket(request, response, next) {
    try {
      let data = await ticketdatacollection.findOne({
        id: request.params.id,
      });
      const employeeData = await employeedatacollection.findOne({
        id: data.ticketRaisedById,
      });
      employeeData.empNoOfTicketsRaised -= 1;
      employeeData.empTicketsRaisedIds =
        employeeData.empTicketsRaisedIds.filter(
          (id) => id !== request.params.id
        );
      await employeedatacollection.updateOne(
        { id: data.ticketRaisedById },
        {
          $set: employeeData,
        }
      );
      data = await ticketdatacollection.deleteOne({ id: request.params.id });
      response.status(200).json({ message: "Ticket Deleted", data: data });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async approveDenyTicket(request, response, next) {
    try {
      const data = await ticketdatacollection.findOne({
        id: request.params.id,
      });
      if (!data) {
        return response.status(404).json({ message: "Ticket not found" });
      }
      if (data.status === "approved") {
        return response
          .status(400)
          .json({ message: "Ticket already approved" });
      }
      if (data.status === "denied") {
        return response.status(400).json({ message: "Ticket already denied" });
      }

      console.log(data);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      const day = now.getDate();

      const formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      const updatedData = await ticketdatacollection.updateOne(
        { id: request.params.id },
        {
          $set: {
            ticketStatus: request.body.ticketStatus,
            dateOfCompletion: formattedDate,
            ticketComments: request.body.ticketComments,
          },
        }
      );
      response
        .status(200)
        .json({ message: "Ticket updated", data: updatedData });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
