import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { User } from "../models/User.model";
import { LoanApplication, LoanStatus } from "../models/LoanApplication.model";

// GET /api/sales/leads
// Returns borrowers who have registered but NOT yet submitted a loan application

export const getLeads = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Find all borrower user IDs that already have a loan
    const appliedBorrowerIds = await LoanApplication.distinct("borrower");

    // Borrowers with no loan entry at all
    const leads = await User.find({
      role: "BORROWER",
      _id: { $nin: appliedBorrowerIds },
    }).select("-password");

    res.status(200).json({ total: leads.length, leads });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
