import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { employeedatacollection, ticketdatacollection } from "../../config.js";
import shortid from "shortid";

export class GeneralController {
    async sendQueryFeedback(request, response, next) {
        try {
            let { name, query } = request.body;
            const data = await querydatacollection.insertOne({name , query});

            response.json({
                statuscode: 200,
                message: "Query/Feedback sent successfully",
                data: data,
            });
        } catch (error) {
            console.error("Error fetching data:", error);
            next(error); // Handle errors by passing them to the next middleware
        }
    }
}