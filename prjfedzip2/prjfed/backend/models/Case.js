const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  customerUsername: {
    type: String,
    required: true
  },
  dcaUsername: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    default: "In Progress"
  },
  approvalStatus: {
    type: String,
    default: ""
  },
  dueDate: {
    type: Date,
    required: true
  },
  history: [
    {
      action: String,
      by: String,
      date: String
    }
  ],
  paymentProof: {
  type: String,
  default: ""
},

});

module.exports = mongoose.model("Case", caseSchema);
