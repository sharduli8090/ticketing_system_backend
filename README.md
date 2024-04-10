# TicketingSystem Backend API documentation

This project is based on Node.js version 20.12.1.

## Development server

Run `npm start` for a dev server. Base URL is `http://localhost:3000/` .

## Hosted Link

This project is hosted on Renderr.com. HostedLink- -> `https://ticketing-system-backend-saom.onrender.com/`

<hr>

## Documentaion

### Admin APIs

1. Login

   - Params : No params
   - Body : email , password
   - Response : statuscode , message , data
   - Endpoints : `api/admin/login`

2. Create Employee

   - Params : No params
   - Body : email , password , empName , empPosition , empDateOfBirth , empDepartment , empGender
   - Response : statuscode , message , data (id , data)
   - Endpoints : `api/admin/createemployee`

3. Get All Employees

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/getallemployee`

4. Get One Employee

   - Params : employee id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/getemployee/:id`

5. Delete All Employee

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/deleteallemployee`

6. Delete One Employee

   - Params : employee id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/deleteemployee/:id`

7. Get All Tickets

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/getallticket`

8. Get One Ticket

   - Params : ticket id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/getticket/:id`

9. Delete All Tickets

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/admin/deleteallticket`

10. Delete one Ticket

    - Params : ticket id
    - Body : No body
    - Response : statuscode , message , data
    - Endpoints : `api/admin/deleteticket/:id`

11. Approve or Deny Ticket

    - Params : ticket id
    - Body : ticketStatus , ticketComments
    - Response : statuscode , message , data
    - Endpoints : `api/admin/appprovedenyticket/:id`

12. Update One Employee
    - Params : employee id
    - Body : can come : email , password , empName , empPosition , empDateOfBirth , empDepartment , empGender
    - Response : statuscode , message , data
    - Endpoints : `api/admin/updateemployee/:id`

13. Get Employee Department Wise
    - Params : No params
    - Body : dept
    - Response : statuscode , message , data
    - Endpoints : `api/admin/getdeptwiseemployee`

14. Get Ticket Department Wise
    - Params : No params
    - Body : dept
    - Response : statuscode , message , data
    - Endpoints : `api/admin/getdeptwiseticket`

<hr>

### Employee APIs

1. Login

   - Params : No params
   - Body : email , password
   - Response : statuscode , message , data
   - Endpoints : `api/employee/login`

2. Get Employee

   - Params : employee id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : `api/employee/getemployee/:id`

3. Get Ticket

   - Params : ticket id
   - Body : empId
   - Response : statuscode , message , data
   - Endpoints : `api/employee/getticket/:id`

4. Create Ticket

   - Params : No params
   - Body : ticketName , ticketDescription , empId , ticketDepartment
   - Response : statuscode , message , data
   - Endpoints : `api/employee/createticket`

5. Close Ticket

   - Params : ticket id
   - Body : empId
   - Response : statuscode , message , data
   - Endpoints : `api/employee/closeticket/:id`

6. Approve or Deny Ticket

   - Params : ticket id
   - Body : empId , ticketComments , ticketStatus
   - Response : statuscode , message , data
   - Endpoints : `api/employee/approvedenyticket/:id`

7. Get Tickets In My Name

   - Params : No params
   - Body : empId
   - Response : statuscode , message , data
   - Endpoints : `api/employee/getticketinmyname`

8. Get Tickets Raised By Me

   - Params : No params
   - Body : empId
   - Response : statuscode , message , data
   - Endpoints : `api/employee/getticketraisedbyme`

<hr>

### General APIs


1. Send Query or Feedbacks

   - Params : No params
   - Body : name , query
   - Response : statuscode , message , data
   - Endpoints : `api/sendqueryfeedback`


# Total 23 APIs
