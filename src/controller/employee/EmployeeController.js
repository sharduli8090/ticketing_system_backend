import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { employeedatacollection, ticketdatacollection } from "../../config.js";
import shortid from "shortid";

export class EmployeeController {
  async login(request, response, next) {
    try {
      let { email, password } = request.body;
      let data = await employeedatacollection.findOne({
        email: email,
      });
      if (data) {
        let isValidPassword = await argon2.verify(data.password, password);
        if (isValidPassword && data.email === email) {
          let token = jwt.sign({ id: data.id, type:"employee" }, process.env.EMPSECRET, {
            expiresIn: "2h",
          });
          response.json({
            statuscode: 200,
            message: "Login Successfull",
            data: {
              id: data.id,
              token: token,
            },
          });
          return;
        } else {
          response.json({
            statuscode: 401,
            message: "Invalid Credentials",
            data: "No data",
          });
          return;
        }
      } else {
        response.json({
          statuscode: 401,
          message: "Invalid Credentials",
          data: "No data",
        });
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getEmployee(request, response, next) {
    try {
      let data = await employeedatacollection.findOne({
        id: request.params.id,
      });
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Employee not found",
          data: "No Data",
        });
        return;
      }
      delete data.password; // Remove password using delete
      delete data._id; // Remove _id using delete
      response.json({
        statuscode: 200,
        message: "Employee Found",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getTicket(request, response, next) {
    try {
      let data = await ticketdatacollection.findOne({
        id: request.params.id,
      });
      let empId = request.body.empId;
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Ticket not found",
          data: "No Data",
        });
        return;
      }
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 404,
          message: "Employee not found",
          data: "No Data",
        });
        return;
      }
      if (
        data.ticketRaisedById !== empId &&
        data.ticketAssignedToId !== empId
      ) {
        response.json({
          statuscode: 400,
          message: "You are not authorized to view this ticket",
          data: "No Data",
        });
        return;
      }
      delete data._id; // Remove _id using delete
      response.json({
        statuscode: 200,
        message: "Ticket Found",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async createTicket(request, response, next) {
    try {
      let { ticketName, ticketDescription, empId } = request.body;
      let { ticketDepartment } = request.body;
      if (!ticketName || !ticketDescription || !empId || !ticketDepartment) {
        response.json({
          statuscode: 400,
          message: "Missing required fields",
          data: "No data",
        });
        return;
      }
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message: "Employee not found",
          data: "No data",
        });
        return;
      }
      ticketDepartment = ticketDepartment.toLowerCase();
      if (
        ticketDepartment !== "hr" &&
        ticketDepartment !== "it" &&
        ticketDepartment !== "finance" &&
        ticketDepartment !== "admin"
      ) {
        response.json({
          statuscode: 400,
          message: "Department should be HR, IT, Finance or Admin",
          data: "No data",
        });
        return;
      }
      let id = shortid.generate();
      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      let day = now.getDate();

      let formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      let ticketAssignedToId = "";
      let ticketAssignedToName = "";
      if (
        employee.empPosition === "manager" ||
        employee.empPosition === "ceo"
      ) {
        ticketAssignedToId = "admin";
        ticketAssignedToName = "admin";
      } else {
        let manager = await employeedatacollection.findOne({
          empDepartment: ticketDepartment,
          empPosition: "manager",
        });
        if (manager) {
          ticketAssignedToId = manager.id;
          ticketAssignedToName = manager.empName;
        } else {
          ticketAssignedToId = "admin";
          ticketAssignedToName = "admin";
        }
      }

      let newTicket = {
        id,
        ticketName,
        ticketDescription,
        ticketRaisedById: empId,
        ticketRaisedByName: employee.empName,
        ticketStatus: "open",
        dateOfCreation: formattedDate,
        ticketAssignedToId,
        ticketAssignedToName,
        dateOfCompletion: null,
        ticketComments: "",
        ticketDepartment,
      };
      let result = await ticketdatacollection.insertOne(newTicket);
      employee.empNoOfTicketsRaised += 1;
      employee.empTicketsRaisedIds.push(id);
      await employeedatacollection.updateOne({ id: empId }, { $set: employee });

      response.json({
        statuscode: 200,
        message: "Ticket created successfully",
        data: { id: id, data: result },
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async closeTicket(request, response, next) {
    try {
      let id = request.params.id;
      let empId = request.body.empId;
      let data = await ticketdatacollection.findOne({ id });
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Ticket not found",
          data: "No data",
        });
        return;
      }
      if (!empId) {
        response.json({
          statuscode: 400,
          message: "Missing required fields",
          data: "No data",
        });
        return;
      }
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message: "Employee not found",
          data: "No data",
        });
        return;
      }

      if (data.ticketRaisedById !== request.body.empId) {
        response.json({
          statuscode: 400,
          message: "You are not authorized to close this ticket",
          data: "No data",
        });
        return;
      }
      if (
        data.ticketStatus === "closed" ||
        data.ticketStatus === "approved" ||
        data.ticketStatus === "denied"
      ) {
        response.json({
          statuscode: 400,
          message: "Ticket already closed",
          data: "No data",
        });
        return;
      }
      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      let day = now.getDate();

      let formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      let result = await ticketdatacollection.updateOne(
        { id: id },
        {
          $set: {
            ticketStatus: "closed",
            dateOfCompletion: formattedDate,
            ticketComments: "Ticket closed by the creator",
          },
        }
      );

      response.json({
        statuscode: 200,
        message: "Ticket closed successfully",
        data: result,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async approveDenyTicket(request, response, next) {
    try {
      let id = request.params.id;
      let data = await ticketdatacollection.findOne({
        id: id,
      });
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Ticket not found",
          data: "No data",
        });
        return;
      }
      let { empId, ticketComments, ticketStatus } = request.body;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message: "Employee not found",
          data: "No data",
        });
        return;
      }
      if (!ticketStatus) {
        response.json({
          statuscode: 400,
          message: "Missing required fields",
          data: "No data",
        });
        return;
      }
      if (ticketStatus !== "approved" && ticketStatus !== "denied") {
        response.json({
          statuscode: 400,
          message: "Invalid ticket status",
          data: "No data",
        });
        return;
      }
      if (ticketStatus === "denied" && !ticketComments) {
        response.json({
          statuscode: 400,
          message: "Missing ticket comments",
          data: "No data",
        });
        return;
      }
      let ticketCommentsFunc = "";
      if (ticketStatus === "approved" && !ticketComments) {
        ticketCommentsFunc = "Ticket approved";
      }
      if (empId !== data.ticketAssignedToId) {
        response.json({
          statuscode: 400,
          message: "You are not authorized to approve/deny this ticket",
          data: "No data",
        });
        return;
      }

      if (data.status === "approved") {
        response.json({
          statuscode: 400,
          message: "Ticket already approved",
          data: "No data",
        });
        return;
      }
      if (data.status === "denied") {
        response.json({
          statuscode: 400,
          message: "Ticket already denied",
          data: "No data",
        });
        return;
      }

      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1; // Months are zero-indexed (January is 0)
      let day = now.getDate();

      let formattedDate = `${year}-${month.toString().padStart(2, "0")}-${day
        .toString()
        .padStart(2, "0")}`;
      let updatedData = await ticketdatacollection.updateOne(
        { id: id },
        {
          $set: {
            ticketStatus: ticketStatus,
            dateOfCompletion: formattedDate,
            ticketComments: ticketCommentsFunc,
          },
        }
      );

      response.json({
        statuscode: 200,
        message: "Ticket updated",
        data: updatedData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getTicketInMyName(request, response, next) {
    try {
      let empId = request.body.empId;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message: "Employee not found",
          data: "No data",
        });
        return;
      }
      let data = await ticketdatacollection
        .find({
          ticketAssignedToId: empId,
        })
        .toArray();
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Tickets not found",
          data: "No data",
        });
        return;
      }

      const filteredData = data.map((item) => {
        delete item._id;
        return item;
      });

      response.json({
        statuscode: 200,
        message: "Tickets found",
        data: filteredData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getTicketRaisedByMe(request, response, next) {
    try {
      let empId = request.body.empId;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message: "Employee not found",
          data: "No data",
        });
        return;
      }
      let data = await ticketdatacollection
        .find({
          ticketRaisedById: empId,
        })
        .toArray();
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Tickets not found",
          data: "No data",
        });
        return;
      }
      const filteredData = data.map((item) => {
        delete item._id;
        return item;
      });

      response.json({
        statuscode: 200,
        message: "Tickets found",
        data: filteredData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
