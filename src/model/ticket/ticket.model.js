import { Schema, model } from "mongoose";
const ticketSchema = new model("ticket", {
  ticketName: {
    type: String,
    required: true,
  },
  ticketDescription: {
    type: String,
    required: true,
  },
  ticketStatus: {
    type: String,
    required: true,
  },
  dateOfCreation: {
    type: Date,
    required: true,
  },
  dateOfCompletion: {
    type: Date,
    required: false,
  },
  ticketRaisedById: {
    type: String,
    required: true,
  },
  ticketRaisedByName: {
    type: String,
    required: true,
  },
  ticketComments: {
    type: String,
    required: false,
  },
});

export default model("Ticket", ticketSchema);
