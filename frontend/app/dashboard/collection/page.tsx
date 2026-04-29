"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getMe, logout, getDisbursedLoans, recordPayment } from "@/lib/api";

export default function CollectionDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State to track which loan's payment form is open
  const [activePaymentLoan, setActivePaymentLoan] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState({
    utrNumber: "",
    amount: "",
    paymentDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    getMe().then(res => {
      if (res.data.user.role !== "COLLECTION") {
        router.push("/login");
        return;
      }
      setUser(res.data.user);
      fetchLoans();
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  async function fetchLoans() {
    try {
      const res = await getDisbursedLoans();
      setLoans(res.data.loans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Calculate dynamic early payoff amount
  function calculateEarlyPayoff(loan: any) {
    if (loan.status === "CLOSED") return 0;
    
    const paymentDateObj = new Date();
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysElapsed = Math.max(1, Math.ceil((paymentDateObj.getTime() - new Date(loan.createdAt).getTime()) / msPerDay));
    
    const interestRate = loan.interestRate || 12;
    const actualInterest = (loan.loanAmount * interestRate * Math.min(daysElapsed, loan.tenure)) / (100 * 365);
    
    return Math.max(0, (loan.loanAmount + actualInterest) - loan.amountPaid);
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  async function handleRecordPayment(e: React.FormEvent, loanId: string) {
    e.preventDefault();
    if (!paymentData.utrNumber || !paymentData.amount || !paymentData.paymentDate) {
      toast.error("Please fill all payment fields");
      return;
    }

    try {
      await recordPayment(loanId, {
        utrNumber: paymentData.utrNumber,
        amount: Number(paymentData.amount),
        paymentDate: paymentData.paymentDate,
      });
      toast.success("Payment recorded successfully!");
      setActivePaymentLoan(null);
      setPaymentData({ utrNumber: "", amount: "", paymentDate: new Date().toISOString().split('T')[0] });
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to record payment");
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF6ED]">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FDF6ED" }}>
      {/* Top Navbar */}
      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #E8DDD0", padding: "16px 32px" }} className="flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" style={{ color: "#C8521A", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.5px", textDecoration: "none" }}>
            CreditFlow
          </Link>
          <span style={{ background: "#FEF0E6", color: "#C8521A", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Collection Portal
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, borderRadius: 16, background: "#F5EBDA", display: "flex", alignItems: "center", justifyContent: "center", color: "#C8521A", fontWeight: 700, fontSize: "14px" }}>
              {user?.name?.charAt(0)}
            </div>
            <span style={{ color: "#1C1109", fontSize: "14px", fontWeight: 600 }}>{user?.name}</span>
            <button onClick={handleLogout} style={{ fontSize: "13px", color: "#8C7B6B", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginLeft: "12px" }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1C1109", letterSpacing: "-0.5px" }}>Active Loans</h1>
            <p style={{ fontSize: "15px", color: "#8C7B6B", marginTop: "4px" }}>Track and record EMI payments for disbursed loans.</p>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "8px", padding: "8px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#8C7B6B", fontWeight: 600 }}>Active Loans</span>
            <span style={{ fontSize: "18px", color: "#1C1109", fontWeight: 700 }}>{loans.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loans.length === 0 ? (
            <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "48px", textAlign: "center", color: "#8C7B6B" }}>
              No active loans available.
            </div>
          ) : (
            loans.map((loan) => (
              <div key={loan._id} style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(28,17,9,0.03)" }}>
                
                {/* Loan Header */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1C1109" }}>{loan.borrower.name}</h3>
                    <p style={{ fontSize: "14px", color: "#8C7B6B", marginBottom: "8px" }}>{loan.borrower.email}</p>
                    <span style={{ background: loan.status === "CLOSED" ? "#D1FAE5" : "#DBEAFE", color: loan.status === "CLOSED" ? "#065F46" : "#1E40AF", padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700 }}>
                      {loan.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-8 text-right">
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 600, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Repayment</p>
                      <p style={{ fontSize: "20px", fontWeight: 700, color: "#1C1109", fontFamily: "monospace", textDecoration: loan.status === "CLOSED" ? "none" : "line-through", opacity: loan.status === "CLOSED" ? 1 : 0.6 }}>₹{loan.totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                    </div>
                    {loan.status !== "CLOSED" && (
                      <div style={{ background: "#DCFCE7", padding: "6px 12px", borderRadius: "8px", border: "1px dashed #16A34A" }}>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "#16A34A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Early Payoff Amount</p>
                        <p style={{ fontSize: "24px", fontWeight: 800, color: "#16A34A", fontFamily: "monospace" }}>₹{calculateEarlyPayoff(loan).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                      </div>
                    )}
                    {loan.status === "CLOSED" && (
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 600, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Outstanding</p>
                        <p style={{ fontSize: "24px", fontWeight: 800, color: "#C8521A", fontFamily: "monospace" }}>₹0</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-[#8C7B6B] mb-2 font-medium">
                    <span>Paid: ₹{loan.amountPaid.toLocaleString()}</span>
                    <span>{((loan.amountPaid / loan.totalRepayment) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden bg-[#E8DDD0]">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ background: loan.outstandingBalance === 0 ? "#16A34A" : "#C8521A", width: `${(loan.amountPaid / loan.totalRepayment) * 100}%` }} 
                    />
                  </div>
                </div>

                {/* Action Area */}
                <div className="pt-4 border-t border-[#E8DDD0]">
                  {loan.status !== "CLOSED" && activePaymentLoan !== loan._id && (
                    <div className="flex justify-end">
                      <button 
                        onClick={() => setActivePaymentLoan(loan._id)}
                        style={{ background: "#FFFFFF", border: "1px solid #C8521A", color: "#C8521A", padding: "10px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer", transition: "all 150ms" }}
                        className="hover:bg-[#FEF0E6]"
                      >
                        + Record Payment
                      </button>
                    </div>
                  )}

                  {activePaymentLoan === loan._id && (
                    <form onSubmit={(e) => handleRecordPayment(e, loan._id)} style={{ background: "#FEF0E6", border: "1px dashed #C8521A", borderRadius: "12px", padding: "20px" }}>
                      <div className="flex justify-between items-center mb-4">
                        <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#1C1109" }}>Record New Payment</h4>
                        <button type="button" onClick={() => setActivePaymentLoan(null)} style={{ background: "none", border: "none", color: "#8C7B6B", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="flex flex-col gap-1.5">
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#1C1109" }}>Amount Received (₹)</label>
                          <input required type="number" step="any" placeholder={`Payoff is ₹${calculateEarlyPayoff(loan).toLocaleString(undefined, { maximumFractionDigits: 0 })}`} style={inputStyle} value={paymentData.amount} onChange={e => setPaymentData({...paymentData, amount: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#1C1109" }}>Date of Payment</label>
                          <input required type="date" style={inputStyle} value={paymentData.paymentDate} onChange={e => setPaymentData({...paymentData, paymentDate: e.target.value})} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label style={{ fontSize: "12px", fontWeight: 600, color: "#1C1109" }}>UTR Number</label>
                          <input required type="text" placeholder="Bank transaction ID" style={inputStyle} value={paymentData.utrNumber} onChange={e => setPaymentData({...paymentData, utrNumber: e.target.value})} />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button type="submit" style={{ background: "#C8521A", border: "none", color: "#FFFFFF", padding: "10px 24px", borderRadius: "8px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
                          Save Payment
                        </button>
                      </div>
                    </form>
                  )}
                </div>
                
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "8px", padding: "10px 12px", fontSize: "14px", color: "#1C1109", outline: "none"
};
