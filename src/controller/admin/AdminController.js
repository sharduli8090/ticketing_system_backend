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
          message:
            "Hey there! Looks like the admin password hasn't been set up yet. Let's get that sorted for top-notch security!",
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
          message: "Welcome back, Admin! You're in. Time to work that magic.",
          data: { id: "admin", token: token },
        });
        return;
      } else {
        response.json({
          statuscode: 401,
          message:
            "Hmm, those credentials don't quite match our records. Let's try that again.",
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
          message:
            "Whoops! We're missing some vital info to bring this new recruit onboard. Please fill in all the details.",
          data: "No Data",
        });
        return;
      }
      let empGender = request.body.empGender || "Not Specified";

      let existingEmployee = await employeedatacollection.findOne({ email });
      if (existingEmployee) {
        response.json({
          statuscode: 400,
          message:
            "Hold on a sec! It seems we already have someone with that email. Double-check, please!",
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
          message:
            "Oops, that department doesn't ring a bell. Please select from HR, IT, Finance, or Admin.",
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
        message:
          "Woohoo! New team member successfully added. Let's give them a warm welcome!",
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
        message: "Here's the A-Team! All employee data, ready to roll.",
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
          message:
            "Hmm, we couldn't quite track down that employee. Perhaps they're on a secret mission?",
          data: "No Data",
        });
        return;
      }
      delete data.password; // Remove password using delete
      delete data._id; // Remove _id using delete
      response.json({
        statuscode: 200,
        message: `There they are! Employee data, right on the spot.`,
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
        message: "Poof! All employee data has been successfully deleted.",
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
          message:
            "That employee seems to have vanished! We couldn't find their record.",
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
        message: `Employee record has been successfully deleted.`,
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
        message: "Here's your to-do list!  All tickets, ready for action.",
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
          message: "We couldn't quite catch that ticket. Perhaps it flew away?",
          data: "No Data",
        });
        return;
      }
      delete data._id;
      response.json({
        statuscode: 200,
        message: "Gotcha! Found that ticket! ",
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
        message: "Presto! All tickets have vanished!",
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
          message:
            "That ticket seems to have disappeared!  We couldn't find it.",
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
        message: "Consider it done! Ticket deleted.",
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
          message:
            "Hmm, that ticket seems to be playing hide-and-seek. We couldn't find it.",
          data: "No Data",
        });
        return;
      }
      if (data.ticketStatus === "approved") {
        response.json({
          statuscode: 400,
          message:
            "No need to approve this one twice! It's already been approved.",
          data: "No Data",
        });
        return;
      }
      if (data.ticketStatus === "denied") {
        response.json({
          statuscode: 400,
          message: "This ticket has already been denied.",
          data: "No Data",
        });
        return;
      }
      if (!ticketStatus) {
        response.json({
          statuscode: 400,
          message:
            "What's the verdict? Please tell us whether to 'approve' or 'deny' the ticket. ",
          data: "No Data",
        });
      }
      if (ticketStatus !== "approved" && ticketStatus !== "denied") {
        response.json({
          statuscode: 400,
          message:
            "Oops, that's not quite a valid status. Please choose either 'approved' or 'denied.'",
          data: "No Data",
        });
        return;
      }

      if (ticketStatus === "denied" && !ticketComments) {
        response.json({
          statuscode: 400,
          message:
            "A little feedback please! Add a comment explaining why the ticket is being denied.",
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
        message: `Ticket ${ticketStatus} successfully!`,
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
          message:
            "We couldn't locate that employee in our system. Double-check and try again.",
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
            message:
              "Oops, someone's already rocking that email address. Please choose another one.",
            data: "No Data",
          });
          return;
        }
      }
      if (request.body.password) {
        if (employee.password === "") {
          response.json({
            statuscode: 401,
            message:
              "Looks like there's no password set up yet. Let's create a new one!",
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
            message:
              "Hold on! The new password can't be the same as the old one. Let's mix things up!",
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
            message:
              "Which department is it? Please select from HR, IT, Finance, or Admin.",
            data: "No Data",
          });
          return;
        } else {
          request.body.empDepartment = dept;
        }
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
        message: "Profile updated! Looking sharp! ",
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
          message:
            "Hmm, that department name seems a bit off. Please double-check and try again.",
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
        message: "Here's the dream team for that department!",
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
          message: "Oops, double-check that department name and try again.",
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
        message: "Tickets, sorted by department, coming right up!",
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
          message:
            "It's quiet on the feedback front! No queries or feedback yet.",
          data: "No Data",
        });
        return;
      }
      response.json({
        statuscode: 200,
        message:
          "Here's what everyone's saying! All queries and feedback, ready for review.",
        data: data,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
