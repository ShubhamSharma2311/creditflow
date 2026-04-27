import mongoose, { Document, Schema } from "mongoose";
import { EmploymentMode } from "./User.model";

// ── Enum ───────────────────────────────────────────────────────────────────

export enum LoanStatus {
  APPLIED    = "APPLIED",
  SANCTIONED = "SANCTIONED",
  DISBURSED  = "DISBURSED",
  CLOSED     = "CLOSED",
  REJECTED   = "REJECTED",
}

// ── Interface ──────────────────────────────────────────────────────────────

export interface ILoanApplication extends Document {
  borrower:           mongoose.Types.ObjectId;  // ref → User

  // Borrower detail snapshot at time of apply (audit trail)
  pan:                string;
  dob:                Date;
  monthlyIncome:      number;
  employmentMode:     EmploymentMode;
  salarySlipUrl:      string;

  // Loan numbers
  loanAmount:         number;   // ₹50,000 – ₹5,00,000
  tenure:             number;   // days (30 – 365)
  interestRate:       number;   // fixed 12% p.a.
  simpleInterest:     number;   // (P × R × T) / (365 × 100)
  totalRepayment:     number;   // P + SI

  // Lifecycle
  status:             LoanStatus;
  rejectionReason?:   string;

  // Executives who acted on this loan
  sanctionedBy?:      mongoose.Types.ObjectId;  // ref → User (Sanction role)
  disbursedBy?:       mongoose.Types.ObjectId;  // ref → User (Disbursement role)

  // Payment tracking
  amountPaid:         number;
  outstandingBalance: number;   // starts = totalRepayment, decreases with payments

  createdAt:          Date;
  updatedAt:          Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    borrower:           { type: Schema.Types.ObjectId, ref: "User", required: true },

    pan:                { type: String, required: true, uppercase: true, trim: true },
    dob:                { type: Date,   required: true },
    monthlyIncome:      { type: Number, required: true },
    employmentMode:     { type: String, enum: Object.values(EmploymentMode), required: true },
    salarySlipUrl:      { type: String, required: true },

    loanAmount:         { type: Number, required: true },
    tenure:             { type: Number, required: true },
    interestRate:       { type: Number, default: 12 },
    simpleInterest:     { type: Number, required: true },
    totalRepayment:     { type: Number, required: true },

    status:             { type: String, enum: Object.values(LoanStatus), default: LoanStatus.APPLIED },
    rejectionReason:    { type: String, default: null },

    sanctionedBy:       { type: Schema.Types.ObjectId, ref: "User", default: null },
    disbursedBy:        { type: Schema.Types.ObjectId, ref: "User", default: null },

    amountPaid:         { type: Number, default: 0 },
    outstandingBalance: { type: Number, required: true },
  },
  { timestamps: true }
);

// ── Model ──────────────────────────────────────────────────────────────────

export const LoanApplication = mongoose.model<ILoanApplication>(
  "LoanApplication",
  LoanApplicationSchema
);
