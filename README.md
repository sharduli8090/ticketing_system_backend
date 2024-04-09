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
   - Endpoints : api/admin/login

2. Create Employee

   - Params : No params
   - Body : email , password , empName , empPosition , empDateOfBirth , empDepartment , empGender
   - Response : statuscode , message , data (id , data)
   - Endpoints : api/admin/createemployee

3. Get All Employees

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/getallemployee

4. Get One Employee

   - Params : employee id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/getemployee?id=/:id

5. Delete All Employee

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/deleteallemployee

6. Delete One Employee

   - Params : employee id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/deleteemployee?id=/:id

7. Get All Tickets

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/getallticket

8. Get One Ticket

   - Params : ticket id
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/getticket?id=/:id

9. Delete All Tickets

   - Params : No params
   - Body : No body
   - Response : statuscode , message , data
   - Endpoints : api/admin/deleteallticket

10. Delete one Ticket

    - Params : ticket id
    - Body : No body
    - Response : statuscode , message , data
    - Endpoints : api/admin/deleteticket?id=/:id

11. Approve or Deny Ticket

    - Params : ticket id
    - Body : ticketStatus , ticketComments
    - Response : statuscode , message , data
    - Endpoints : api/admin/appprovedenyticket?id=/:id

12. Update One Employee
    - Params : employee id
    - Body : can come : email , password , empName , empPosition , empDateOfBirth , empDepartment , empGender
    - Response : statuscode , message , data
    - Endpoints : api/admin/updateemployee?id=/:id

<hr>

### Employee APIs

    - Params :
    - Body :
    - Response : statuscode , message , data
    - Endpoints :
