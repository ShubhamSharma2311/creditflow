import mongoose, { Document, Schema } from "mongoose";

// ── Interface ──────────────────────────────────────────────────────────────

export interface IPayment extends Document {
  loan:        mongoose.Types.ObjectId;  // ref → LoanApplication
  recordedBy:  mongoose.Types.ObjectId;  // ref → User (Collection executive)
  utrNumber:   string;                   // globally unique — no duplicates allowed
  amount:      number;
  paymentDate: Date;
  createdAt:   Date;
  updatedAt:   Date;
}

// ── Schema ─────────────────────────────────────────────────────────────────

const PaymentSchema = new Schema<IPayment>(
  {
    loan:        { type: Schema.Types.ObjectId, ref: "LoanApplication", required: true },
    recordedBy:  { type: Schema.Types.ObjectId, ref: "User", required: true },
    utrNumber:   { type: String, required: true, unique: true, trim: true },
    amount:      { type: Number, required: true, min: 1 },
    paymentDate: { type: Date,   required: true, default: Date.now },
  },
  { timestamps: true }
);

// ── Model ──────────────────────────────────────────────────────────────────

export const Payment = mongoose.model<IPayment>("Payment", PaymentSchema);
