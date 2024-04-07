import { Schema, model } from "mongoose";
import { hash } from "argon2";

const employeeSchema = new Schema( {
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  empName: {
    type: String,
    required: true,
  },
  empPosition: {
    type: String,
    required: true,
  },
  empGender: {
    type: String,
    required: false,
  },
  empDateOfBirth: {
    type: Date,
    required: true,
  },
  empDateOfJoining: {
    type: String,
    required: true,
  },
  empNoOfTicketsRaised: {
    type: Number,
    required: true,
  },
  empTicketsRaisedIds: {
    type: Array,
    required: false,
  },
});

export default model("Employee", employeeSchema);
