"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMyLoans } from "@/lib/api";

export default function MyLoansPage() {
  const router = useRouter();
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyLoans()
      .then(res => {
        setLoans(res.data.loans);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF6ED]">Loading...</div>;

  return (
    <div className="min-h-screen" style={{ background: "#FDF6ED" }}>
      {/* Top Navbar */}
      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #E8DDD0", padding: "16px 32px" }} className="flex justify-between items-center">
        <Link href="/" style={{ color: "#C8521A", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.5px", textDecoration: "none" }}>
          CreditFlow
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/borrower" style={{ color: "#8C7B6B", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
            New Application
          </Link>
          <div className="flex items-center gap-3 border-l border-[#E8DDD0] pl-6">
            <Link href="/borrower/my-loans" style={{ color: "#1C1109", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>
              My Loans
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[800px] mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1C1109", letterSpacing: "-0.5px" }}>My Loans</h1>
            <p style={{ color: "#8C7B6B", fontSize: "15px", marginTop: "4px" }}>Track the status of your loan applications.</p>
          </div>
          <Link 
            href="/borrower" 
            style={{ 
              background: "#C8521A", color: "#FFFFFF", padding: "10px 16px", borderRadius: "8px", 
              fontWeight: 600, fontSize: "14px", textDecoration: "none", boxShadow: "0 4px 12px rgba(200,82,26,0.15)" 
            }}
          >
            + Apply for Loan
          </Link>
        </div>

        {loans.length === 0 ? (
          <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "60px 40px", textAlign: "center", boxShadow: "0 8px 32px rgba(28,17,9,0.04)" }}>
            <div style={{ width: "64px", height: "64px", background: "#FEF0E6", borderRadius: "32px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <span style={{ fontSize: "28px" }}>📄</span>
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1C1109", marginBottom: "8px" }}>No applications yet</h3>
            <p style={{ color: "#8C7B6B", fontSize: "14px", marginBottom: "24px", maxWidth: "300px", margin: "0 auto 24px" }}>
              You haven't applied for a loan yet. Check your eligibility and apply in just a few minutes.
            </p>
            <Link href="/borrower" style={{ color: "#C8521A", fontWeight: 600, fontSize: "14px", textDecoration: "none" }}>
              Start application →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {loans.map(loan => (
              <div key={loan._id} style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "24px", boxShadow: "0 8px 32px rgba(28,17,9,0.04)" }}>
                
                {/* Header: Amount + Status */}
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>Loan Amount</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: "#1C1109", fontFamily: "monospace" }}>₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6 p-4 rounded-xl" style={{ background: "#FDF6ED", border: "1px solid #E8DDD0" }}>
                  <div>
                    <p style={{ fontSize: "12px", color: "#8C7B6B", fontWeight: 600, marginBottom: "2px" }}>Tenure</p>
                    <p style={{ fontSize: "15px", color: "#1C1109", fontWeight: 700, fontFamily: "monospace" }}>{loan.tenure} days</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#8C7B6B", fontWeight: 600, marginBottom: "2px" }}>Interest (12%)</p>
                    <p style={{ fontSize: "15px", color: "#1C1109", fontWeight: 700, fontFamily: "monospace" }}>₹{loan.simpleInterest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: "12px", color: "#8C7B6B", fontWeight: 600, marginBottom: "2px" }}>Total Repayment</p>
                    <p style={{ fontSize: "15px", color: "#C8521A", fontWeight: 700, fontFamily: "monospace" }}>₹{loan.totalRepayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {loan.status === "REJECTED" && loan.rejectionReason && (
                  <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderLeft: "4px solid #B91C1C", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#B91C1C", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "2px" }}>Reason for rejection</p>
                    <p style={{ fontSize: "14px", color: "#991B1B", fontWeight: 500 }}>{loan.rejectionReason}</p>
                  </div>
                )}

                {/* Timeline */}
                <div className="mt-8">
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" }}>Application Timeline</p>
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-4 left-4 right-4 h-[2px] -z-10" style={{ background: "#E8DDD0" }} />
                    
                    <TimelineStep label="Applied" active={true} completed={true} />
                    <TimelineStep label="Sanctioned" active={loan.status === "SANCTIONED" || loan.status === "DISBURSED" || loan.status === "CLOSED"} completed={loan.status === "SANCTIONED" || loan.status === "DISBURSED" || loan.status === "CLOSED"} />
                    <TimelineStep label="Disbursed" active={loan.status === "DISBURSED" || loan.status === "CLOSED"} completed={loan.status === "DISBURSED" || loan.status === "CLOSED"} />
                    <TimelineStep label="Closed" active={loan.status === "CLOSED"} completed={loan.status === "CLOSED"} />
                  </div>
                </div>

                {/* Outstanding Balance Bar (only if disbursed/closed) */}
                {(loan.status === "DISBURSED" || loan.status === "CLOSED") && (
                  <div className="mt-8 pt-6" style={{ borderTop: "1px dashed #E8DDD0" }}>
                    <div className="flex justify-between items-end mb-2">
                      <span style={{ fontSize: "13px", fontWeight: 600, color: "#1C1109" }}>Outstanding Balance</span>
                      <span style={{ fontSize: "16px", fontWeight: 700, color: "#C8521A", fontFamily: "monospace" }}>
                        ₹{loan.outstandingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#F5EBDA" }}>
                      <div 
                        className="h-full rounded-full transition-all duration-1000" 
                        style={{ 
                          background: loan.outstandingBalance === 0 ? "#16A34A" : "#C8521A", 
                          width: `${(loan.amountPaid / loan.totalRepayment) * 100}%` 
                        }} 
                      />
                    </div>
                    <p style={{ fontSize: "12px", color: "#8C7B6B", marginTop: "6px", textAlign: "right" }}>
                      ₹{loan.amountPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })} paid
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Subcomponents

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string, color: string, text: string }> = {
    APPLIED: { bg: "#FEF3C7", color: "#92400E", text: "Under Review" },
    SANCTIONED: { bg: "#DBEAFE", color: "#1E40AF", text: "Sanctioned" },
    DISBURSED: { bg: "#F3E8FF", color: "#6B21A8", text: "Disbursed" },
    CLOSED: { bg: "#D1FAE5", color: "#065F46", text: "Closed" },
    REJECTED: { bg: "#FEE2E2", color: "#991B1B", text: "Rejected" },
  };

  const style = styles[status] || styles.APPLIED;

  return (
    <span style={{ background: style.bg, color: style.color, padding: "6px 12px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {style.text}
    </span>
  );
}

function TimelineStep({ label, active, completed }: { label: string, active: boolean, completed: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 bg-[#FFFFFF] px-2">
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300"
        style={{
          background: completed ? "#16A34A" : active ? "#C8521A" : "#FFFFFF",
          border: completed ? "2px solid #16A34A" : active ? "2px solid #C8521A" : "2px solid #E8DDD0",
          color: completed || active ? "#FFFFFF" : "#E8DDD0",
          boxShadow: active && !completed ? "0 0 0 4px rgba(200,82,26,0.15)" : "none"
        }}
      >
        {completed ? "✓" : "•"}
      </div>
      <span style={{ fontSize: "11px", fontWeight: active || completed ? 700 : 600, color: active || completed ? "#1C1109" : "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
    </div>
  );
}
