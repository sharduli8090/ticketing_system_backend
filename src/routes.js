import { body, param } from "express-validator";
import { TestController } from "./controller/test/TestController.js";
import { AdminController } from "./controller/admin/AdminController.js";
import { EmployeeController } from "./controller/employee/EmployeeController.js";
import { GeneralController } from "./controller/general/GeneralController.js";

export const Routes = [
  {
    method: "get",
    route: "/",
    auth: false,
    controller: TestController,
    action: "one",
    validation: [],
  },
  {
    method: "post",
    route: "/api/admin/login",
    auth: false,
    controller: AdminController,
    action: "login",
    validation: [],
  },
  {
    method: "post",
    route: "/api/employee/login",
    auth: false,
    controller: EmployeeController,
    action: "login",
    validation: [],
  },
  {
    method: "post",
    route: "/api/employee/createticket",
    auth: true,
    controller: EmployeeController,
    action: "createTicket",
    validation: [],
  },
  {
    method: "post",
    route: "/api/admin/createemployee",
    auth: true,
    controller: AdminController,
    action: "createEmployee",
    validation: [],
  },
  {
    method: "get",
    route: "/api/admin/getallemployee",
    auth: true,
    controller: AdminController,
    action: "getAllEmployee",
    validation: [],
  },
  {
    method: "delete",
    route: "/api/admin/deleteallemployee",
    auth: true,
    controller: AdminController,
    action: "deleteAllEmployee",
    validation: [],
  },
  {
    method: "delete",
    route: "/api/admin/deleteemployee/:id",
    auth: true,
    controller: AdminController,
    action: "deleteEmployee",
    validation: [],
  },
  {
    method: "delete",
    route: "/api/admin/deleteticket/:id",
    auth: true,
    controller: AdminController,
    action: "deleteTicket",
    validation: [],
  },
  {
    method: "delete",
    route: "/api/admin/deleteallticket",
    auth: true,
    controller: AdminController,
    action: "deleteAllTicket",
    validation: [],
  },
  {
    method: "get",
    route: "/api/admin/getallticket",
    auth: true,
    controller: AdminController,
    action: "getAllTicket",
    validation: [],
  },
  {
    method: "get",
    route: "/api/admin/getemployee/:id",
    auth: true,
    controller: AdminController,
    action: "getEmployee",
    validation: [],
  },
  {
    method: "get",
    route: "/api/employee/getemployee/:id",
    auth: true,
    controller: EmployeeController,
    action: "getEmployee",
    validation: [],
  },
  {
    method: "get",
    route: "/api/admin/getticket/:id",
    auth: true,
    controller: AdminController,
    action: "getTicket",
    validation: [],
  },
  {
    method: "get",
    route: "/api/employee/getticket/:id",
    auth: true,
    controller: EmployeeController,
    action: "getTicket",
    validation: [],
  },
  {
    method: "get",
    route: "/api/employee/getticketinmyname",
    auth: true,
    controller: EmployeeController,
    action: "getTicketInMyName",
    validation: [],
  },
  {
    method: "get",
    route: "/api/admin/getdeptwiseticket",
    auth: true,
    controller: AdminController,
    action: "getDeptWiseTicket",
    validation: [],
  },
  {
    method: "get",
    route: "/api/admin/getdeptwiseemployee",
    auth: true,
    controller: AdminController,
    action: "getDeptWiseEmployee",
    validation: [],
  },
  {
    method: "get",
    route: "/api/employee/getticketraisedbyme",
    auth: true,
    controller: EmployeeController,
    action: "getTicketRaisedByMe",
    validation: [],
  },
  {
    method: "get",
    route: "/api/sendqueryfeedback",
    auth: false,
    controller: GeneralController,
    action: "sendQueryFeedback",
    validation: [],
  },
  {
    method: "put",
    route: "/api/admin/approvedenyticket/:id",
    auth: true,
    controller: AdminController,
    action: "approveDenyTicket",
    validation: [],
  },
  {
    method: "put",
    route: "/api/admin/updateemployee/:id",
    auth: true,
    controller: AdminController,
    action: "updateEmployee",
    validation: [],
  },
  {
    method: "put",
    route: "/api/employee/closeticket/:id",
    auth: true,
    controller: EmployeeController,
    action: "closeTicket",
    validation: [],
  },
];
