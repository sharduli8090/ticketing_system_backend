import argon2 from "argon2";
import jwt from "jsonwebtoken";
import shortid from "shortid";
import { employeedatacollection, ticketdatacollection } from "../../config.js";

export class EmployeeController {
  async login(request, response, next) {
    try {
      let { email, password } = request.body;
      let data = await employeedatacollection.findOne({
        email: email,
      });
      if (data) {
        if (data.password === "") {
          response.json({
            statuscode: 401,
            message:
              "Psst! Looks like your account needs a little setup.  Contact an admin to set your password.",
            data: "No data",
          });
          return;
        }
        let isValidPassword = await argon2.verify(data.password, password);
        if (isValidPassword && data.email === email) {
          let token = jwt.sign(
            { id: data.id, type: "employee" },
            process.env.EMPSECRET,
            {
              expiresIn: "2h",
            }
          );
          response.json({
            statuscode: 200,
            message: `Welcome back, ${data.empName}! Ready to dive in?`,
            data: {
              id: data.id,
              token: token,
            },
          });
          return;
        } else {
          response.json({
            statuscode: 401,
            message:
              "Hmm, those credentials aren't quite clicking.  Try again, or maybe hit 'Forgot Password'? ",
            data: "No data",
          });
          return;
        }
      } else {
        response.json({
          statuscode: 401,
          message:
            "We couldn't find an account with those details. Double-check and try again.",
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
          message:
            "We couldn't track down an employee with that ID. Maybe they're on a secret mission?",
          data: "No Data",
        });
        return;
      }
      delete data.password; // Remove password using delete
      delete data._id; // Remove _id using delete
      response.json({
        statuscode: 200,
        message: `Bingo! Here's the intel on ${data.empName}.`,
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
          message:
            "That ticket seems to have gone off the radar. Double-check the ID and try again.",
          data: "No Data",
        });
        return;
      }
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 404,
          message:
            "Hmm, we're having trouble finding your employee record.  Please try again.",
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
          message: "Hold on there!  You're not authorized to view this ticket.",
          data: "No Data",
        });
        return;
      }
      delete data._id; // Remove _id using delete
      response.json({
        statuscode: 200,
        message: "Here are the ticket details you requested.",
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
          message:
            "Whoa there!  It looks like you missed a few fields.  Please fill in all the details.",
          data: "No data",
        });
        return;
      }
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message:
            "We couldn't quite catch your employee record. Could you try again?",
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
          message:
            "Which department is this for? Please choose from HR, IT, Finance, or Admin.",
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
        message: "Ticket created!  We'll be in touch soon.",
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
          message:
            "Hmm, we couldn't find a ticket with that ID.  Please try again.",
          data: "No data",
        });
        return;
      }
      if (!empId) {
        response.json({
          statuscode: 400,
          message: "Please provide your employee ID to proceed.",
          data: "No data",
        });
        return;
      }
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message:
            "We're having a little trouble finding your employee record. Try again in a bit?",
          data: "No data",
        });
        return;
      }

      if (data.ticketRaisedById !== request.body.empId) {
        response.json({
          statuscode: 400,
          message: "Hold on a sec! You're not authorized to close this ticket.",
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
          message: "Looks like this ticket has already been closed.",
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
        message: "Ticket closed! Thanks for letting us know.",
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
          message: "Hmm, we can't seem to find that ticket.  Try again?",
          data: "No data",
        });
        return;
      }
      let { empId, ticketComments, ticketStatus } = request.body;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message:
            "We're having a bit of trouble locating your employee record.  Hang tight!",
          data: "No data",
        });
        return;
      }
      if (!ticketStatus) {
        response.json({
          statuscode: 400,
          message:
            "Should we approve or deny? Please specify the ticket status.",
          data: "No data",
        });
        return;
      }
      if (ticketStatus !== "approved" && ticketStatus !== "denied") {
        response.json({
          statuscode: 400,
          message:
            "Oops, looks like that's not a valid status.  Use 'approved' or 'denied'.",
          data: "No data",
        });
        return;
      }
      if (ticketStatus === "denied" && !ticketComments) {
        response.json({
          statuscode: 400,
          message:
            "Could you give us a bit more context? Please add a comment explaining why the ticket is being denied.",
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
          message:
            "Hold on there! You're not authorized to approve or deny this ticket.",
          data: "No data",
        });
        return;
      }

      if (data.status === "approved") {
        response.json({
          statuscode: 400,
          message:
            "This ticket's already been approved! No need to do it again.",
          data: "No data",
        });
        return;
      }
      if (data.status === "denied") {
        response.json({
          statuscode: 400,
          message: "This ticket's already been denied.",
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
            ticketComments: ticketComments || ticketCommentsFunc,
          },
        }
      );

      response.json({
        statuscode: 200,
        message: "Ticket updated! Thanks for the quick action.",
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
          message:
            "We couldn't locate your employee record. Could you try again?",
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
          message:
            "Looks like you have a clean slate!  No tickets assigned to you right now.",
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
        message: "Here are the tickets waiting for your expertise.",
        data: filteredData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

  //pagination for get ticket in my name
  async getTicketInMyNamePagination(request, response, next) {
    try{
      let { startIndex, endIndex, limit } = request.body;
      if(endIndex < startIndex){
        response.json({
          statuscode: 400,
          message: "End index should be greater than start index",
          data: "No Data",
        });
      return;
      }
      if (limit !== endIndex - startIndex) {
        response.json({
          statuscode: 400,
          message: "Limit should be equal to endIndex - startIndex",
          data: "No Data",
        });
        return;
      }

      let empId = request.body.empId;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message:
            "We're having some trouble finding your employee record. Could you try again?",
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
          message:

            "Looks like you have a clean slate!  No tickets assigned to you right now.",
          data: "No data",
        });
        return;
      }
      const filteredData = data.map((item) => {
        delete item._id;
        return item;
      }
      );

      // If endIndex exceeds the length of the data, adjust it
      if (filteredData.length < endIndex) {
        endIndex = filteredData.length;
      }

      // Calculate the pagination limit if endIndex is greater than startIndex + limit
      if (endIndex - startIndex > limit) {
        endIndex = startIndex + limit;
      }

      // Slice the data to get the paginated result
      let paginatedData = filteredData.slice(startIndex, endIndex);

      // Return the paginated data
      response.json({
        statuscode: 200,
        message: "Here are the tickets waiting for your expertise.",
        data: paginatedData,
      });
      return;

    }
    catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }

    

  // pagination for tickets raised by the employee
  async getTicketRaisedByMePagination(request, response, next) {
    try{
      let { startIndex, endIndex, limit } = request.body;
      if(endIndex < startIndex){
        response.json({
          statuscode: 400,
          message: "End index should be greater than start index",
          data: "No Data",
        });
      return;
      }
      if (limit !== endIndex - startIndex) {
        response.json({
          statuscode: 400,
          message: "Limit should be equal to endIndex - startIndex",
          data: "No Data",
        });
        return;
      }

      let empId = request.body.empId;
      let employee = await employeedatacollection.findOne({ id: empId });
      if (!employee) {
        response.json({
          statuscode: 400,
          message:
            "We're having some trouble finding your employee record. Could you try again?",
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
          message:
            "Looks like you haven't raised any tickets yet.  If you need anything, don't hesitate to create one!",
          data: "No data",
        });
        return;
      }
      const filteredData = data.map((item) => {
        delete item._id;
        return item;
      });

     // If endIndex exceeds the length of the data, adjust it
     if (filteredData.length < endIndex) {
      endIndex = filteredData.length;
    }

    // Calculate the pagination limit if endIndex is greater than startIndex + limit
    if (endIndex - startIndex > limit) {
      endIndex = startIndex + limit;
    }

    // Slice the data to get the paginated result
    let paginatedData = filteredData.slice(startIndex, endIndex);

    // Return the paginated data
    response.json({
      statuscode: 200,
      message: "Here's a recap of the tickets you've raised.",
      data: paginatedData,
    });
    return;

    }
    catch (error) {
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
          message:
            "We're having some trouble finding your employee record. Could you try again?",
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
          message:
            "Looks like you haven't raised any tickets yet.  If you need anything, don't hesitate to create one!",
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
        message: "Here's a recap of the tickets you've raised.",
        data: filteredData,
      });
      return;
    } catch (error) {
      console.error("Error fetching data:", error);
      next(error); // Handle errors by passing them to the next middleware
    }
  }
}
