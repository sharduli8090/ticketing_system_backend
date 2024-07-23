import jwt from "jsonwebtoken";
import shortid from "shortid";
import {
  admindatacollection,
  employeedatacollection,
  querydatacollection,
  ticketdatacollection,
} from "../../config.js";

import argon2 from "argon2";

export class AdminController {
  async login(request, response, next) {
    try {
      let data = await admindatacollection.findOne();
      let password = request.body.password;
      let email = request.body.email;
      if (data.password === "") {
        response.json({
          statuscode: 401,
          message: "Password missing in database.",
          data: "No data",
        });
        return;
      }
      if (data && data.email === email && data.password === password) {
        let token = jwt.sign(
          { id: "admin", type: "admin" },
          process.env.SECRET,
          {
            expiresIn: "2h",
          }
        );
        response.json({
          statuscode: 200,
          message: "Login Successfull! Welcome Admin.",
          data: { id: "admin", token: token },
        });
        return;
      } else {
        response.json({
          statuscode: 401,
          message: "Invalid Credentials",
          data: "No Data",
        });
        return;
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async createEmployee(request, response, next) {
    try {
      let { email, password, empName, empDateOfBirth } = request.body;
      let { empDepartment, empPosition } = request.body;
      if (
        !email ||
        !password ||
        !empName ||
        !empPosition ||
        !empDateOfBirth ||
        !empDepartment
      ) {
        response.json({
          statuscode: 400,
          message: "Missing required fields",
          data: "No Data",
        });
        return;
      }
      let empGender = request.body.empGender || "Not Specified";

      let existingEmployee = await employeedatacollection.findOne({ email });
      if (existingEmployee) {
        response.json({
          statuscode: 400,
          message: "Employee with this email already exists",
          data: "No Data",
        });
        return;
      }
      empDepartment = empDepartment.toLowerCase();
      empPosition = empPosition.toLowerCase();
      if (
        empDepartment !== "hr" &&
        empDepartment !== "it" &&
        empDepartment !== "finance" &&
        empDepartment !== "admin"
      ) {
        response.json({
          statuscode: 400,
          message: "Department should be HR, IT, Finance or Admin",
          data: "No Data",
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
      let empDateOfJoining = formattedDate;
      let empNoOfTicketsRaised = 0;
      let empTicketsRaisedIds = [];
      let hashedpassword = await argon2.hash(password);

      let data = await employeedatacollection.insertOne({
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
        empDepartment,
      });
      response.json({
        statuscode: 200,
        message: "Employee Created Successfully",
        data: { id: id, data },
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getAllEmployee(request, response, next) {
    try {
      let data = await employeedatacollection.find().toArray();
      let filteredData = data.map((employee) => {
        delete employee.password;
        delete employee._id;
        return employee;
      });
      response.json({
        statuscode: 200,
        message: "All Employees",
        data: filteredData,
      });
      return;
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

  async deleteAllEmployee(request, response, next) {
    try {
      let data = await employeedatacollection.deleteMany();
      await ticketdatacollection.deleteMany();
      response.json({
        statuscode: 200,
        message: "All Employees Deleted",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async deleteEmployee(request, response, next) {
    try {
      let id = request.params.id;
      let data = await employeedatacollection.findOne({
        id: id,
      });
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Employee not found",
          data: "No Data",
        });
        return;
      }
      let ticketIds = data.empTicketsRaisedIds;
      if (ticketIds.length > 0) {
        await ticketdatacollection.deleteMany({ id: { $in: ticketIds } });
      }
      data = await employeedatacollection.deleteOne({ id: id });
      response.json({
        statuscode: 200,
        message: "Employee Deleted",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getAllTicket(request, response, next) {
    try {
      let data = await ticketdatacollection.find().toArray();

      let filteredData = data.map((ticket) => {
        delete ticket._id;
        return ticket;
      });
      response.json({
        statuscode: 200,
        message: "All Tickets",
        data: filteredData,
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
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Ticket not found",
          data: "No Data",
        });
        return;
      }
      delete data._id;
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

  async deleteAllTicket(request, response, next) {
    try {
      let data = await ticketdatacollection.deleteMany();
      let employeeData = await employeedatacollection.find().toArray();
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

      response.json({
        statuscode: 200,
        message: "All Tickets Deleted",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async deleteTicket(request, response, next) {
    try {
      let ticketId = request.params.id;
      let data = await ticketdatacollection.findOne({
        id: ticketId,
      });
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Ticket not found",
          data: "No Data",
        });
        return;
      }

      let employeeData = await employeedatacollection.findOne({
        id: data.ticketRaisedById,
      });
      if (employeeData) {
        employeeData.empNoOfTicketsRaised -= 1;
        employeeData.empTicketsRaisedIds =
          employeeData.empTicketsRaisedIds.filter((id) => id !== ticketId);
        await employeedatacollection.updateOne(
          { id: data.ticketRaisedById },
          {
            $set: employeeData,
          }
        );
      }
      data = await ticketdatacollection.deleteOne({ id: ticketId });
      response.json({
        statuscode: 200,
        message: "Ticket Deleted",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async approveDenyTicket(request, response, next) {
    try {
      let { ticketComments, ticketStatus } = request.body;
      let id = request.params.id;
      let data = await ticketdatacollection.findOne({
        id: id,
      });
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Ticket not found",
          data: "No Data",
        });
        return;
      }
      if (data.ticketStatus === "approved") {
        response.json({
          statuscode: 400,
          message: "Ticket already approved",
          data: "No Data",
        });
        return;
      }
      if (data.ticketStatus === "denied") {
        response.json({
          statuscode: 400,
          message: "Ticket already denied",
          data: "No Data",
        });
        return;
      }
      if (!ticketStatus) {
        response.json({
          statuscode: 400,
          message: "Missing required fields",
          data: "No Data",
        });
      }
      if (ticketStatus !== "approved" && ticketStatus !== "denied") {
        response.json({
          statuscode: 400,
          message: "Invalid ticket status",
          data: "No Data",
        });
        return;
      }

      if (ticketStatus === "denied" && !ticketComments) {
        response.json({
          statuscode: 400,
          message: "Missing ticket comments",
          data: "No Data",
        });
        return;
      }
      let ticketCommentsFunc = "";
      if (ticketStatus === "approved" && !ticketComments) {
        ticketCommentsFunc = "Ticket approved";
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
            ticketComments: ticketComments || ticketCommentsFunc,
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

  async updateEmployee(request, response, next) {
    try {
      let empId = request.params.id;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message: "Employee not found",
          data: "No Data",
        });
        return;
      }
      if (request.body.email) {
        let existingEmployee = await employeedatacollection.findOne({
          email: request.body.email,
        });
        if (existingEmployee && existingEmployee.id !== empId) {
          response.json({
            statuscode: 400,
            message: "Employee with this email already exists",
            data: "No Data",
          });
          return;
        }
      }
      if (request.body.password) {
        if (employee.password === "") {
          response.json({
            statuscode: 401,
            message: "Password missing in database.",
            data: "No data",
          });
          return;
        }
        let isValidPassword = await argon2.verify(
          employee.password,
          request.body.password
        );
        if (!isValidPassword) {
          let hashedpassword = await argon2.hash(request.body.password);
          request.body.password = hashedpassword;
        } else {
          response.json({
            statuscode: 400,
            message: "Old password is equal to new password",
            data: "No Data",
          });
          return;
        }
      }
      if (request.body.empDepartment) {
        let dept = request.body.empDepartment;
        dept = dept.toLowerCase();
        if (
          dept !== "hr" &&
          dept !== "it" &&
          dept !== "finance" &&
          dept !== "admin"
        ) {
          response.json({
            statuscode: 400,
            message: "Department should be HR, IT, Finance or Admin",
            data: "No Data",
          });
          return;
        }
        request.body.empDepartment = dept;
      }
      if (request.body.empPosition) {
        request.body.empPosition = request.body.empPosition.toLowerCase();
      }

      let result = await employeedatacollection.updateOne(
        { id: empId },
        { $set: request.body }
      );

      response.json({
        statuscode: 200,
        message: "Profile updated successfully",
        data: result,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getDeptWiseEmployee(request, response, next) {
    try {
      let dept = request.body.dept;
      dept = dept.toLowerCase();
      if (
        dept !== "hr" &&
        dept !== "it" &&
        dept !== "finance" &&
        dept !== "admin"
      ) {
        response.json({
          statuscode: 400,
          message: "Department should be HR, IT, Finance or Admin",
          data: "No Data",
        });
        return;
      }
      let data = await employeedatacollection
        .find({ empDepartment: dept })
        .toArray();
      let filteredData = data.map((employee) => {
        delete employee.password;
        delete employee._id;
        return employee;
      });
      response.json({
        statuscode: 200,
        message: "All Employees department wise",
        data: filteredData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getDeptWiseTicket(request, response, next) {
    try {
      let dept = request.body.dept;
      dept = dept.toLowerCase();
      if (
        dept !== "hr" &&
        dept !== "it" &&
        dept !== "finance" &&
        dept !== "admin"
      ) {
        response.json({
          statuscode: 400,
          message: "Department should be HR, IT, Finance or Admin",
          data: "No Data",
        });
        return;
      }
      let data = await ticketdatacollection
        .find({ ticketDepartment: dept })
        .toArray();
      let filteredData = data.map((ticket) => {
        delete ticket._id;
        return ticket;
      });
      response.json({
        statuscode: 200,
        message: "All Tickets department wise",
        data: filteredData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  async getQuery(request, response, next) {
    try {
      let data = await querydatacollection.find().toArray();
      if (!data) {
        response.json({
          statuscode: 404,
          message: "Queries/Feedbacks not found",
          data: "No Data",
        });
        return;
      }
      response.json({
        statuscode: 200,
        message: "Found",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
