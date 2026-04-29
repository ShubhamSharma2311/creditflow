"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { getMe, logout, getSanctionedLoans, disburseLoan } from "@/lib/api";

export default function DisbursementDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [confirmDisburseId, setConfirmDisburseId] = useState<string | null>(null);

  useEffect(() => {
    getMe().then(res => {
      if (res.data.user.role !== "DISBURSEMENT") {
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
      const res = await getSanctionedLoans();
      setLoans(res.data.loans);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  async function handleDisburse(id: string) {
    try {
      await disburseLoan(id);
      toast.success("Loan disbursed successfully");
      setConfirmDisburseId(null);
      fetchLoans();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to disburse loan");
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
            Disbursement Portal
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
            <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#1C1109", letterSpacing: "-0.5px" }}>Ready for Disbursement</h1>
            <p style={{ fontSize: "15px", color: "#8C7B6B", marginTop: "4px" }}>Sanctioned loans waiting for funds transfer.</p>
          </div>
          <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "8px", padding: "8px 16px", display: "flex", gap: "12px", alignItems: "center" }}>
            <span style={{ fontSize: "13px", color: "#8C7B6B", fontWeight: 600 }}>Total Pending</span>
            <span style={{ fontSize: "18px", color: "#1C1109", fontWeight: 700 }}>{loans.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loans.length === 0 ? (
            <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "48px", textAlign: "center", color: "#8C7B6B" }}>
              No loans ready for disbursement.
            </div>
          ) : (
            loans.map((loan) => (
              <div key={loan._id} style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(28,17,9,0.03)" }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#1C1109" }}>{loan.borrower.name}</h3>
                    <p style={{ fontSize: "14px", color: "#8C7B6B" }}>{loan.borrower.email}</p>
                  </div>
                  <div style={{ textAlign: "right", background: "#FEF0E6", padding: "12px 24px", borderRadius: "8px", border: "1px dashed #C8521A" }}>
                    <p style={{ fontSize: "12px", fontWeight: 700, color: "#C8521A", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount to Disburse</p>
                    <p style={{ fontSize: "28px", fontWeight: 800, color: "#1C1109", fontFamily: "monospace", letterSpacing: "-1px" }}>₹{loan.loanAmount.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#E8DDD0]">
                  <button 
                    onClick={() => setConfirmDisburseId(loan._id)}
                    style={{ background: "#C8521A", border: "none", color: "#FFFFFF", padding: "12px 32px", borderRadius: "8px", fontSize: "15px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(200,82,26,0.2)" }}
                  >
                    Initiate Transfer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Disbursement Confirmation Modal */}
      {confirmDisburseId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C1109]/40 backdrop-blur-sm p-4">
          <div style={{ background: "#FFFFFF", borderRadius: "20px", padding: "32px", width: "100%", maxWidth: "440px", boxShadow: "0 24px 48px rgba(28,17,9,0.1)" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "24px", background: "#FEF0E6", color: "#C8521A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "20px" }}>
              ₹
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#1C1109", marginBottom: "8px" }}>Confirm Disbursement?</h3>
            <p style={{ color: "#8C7B6B", fontSize: "15px", lineHeight: "1.5", marginBottom: "32px" }}>
              This action will permanently transfer funds to the borrower's registered bank account and move the loan status to "Disbursed".
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDisburseId(null)} style={{ padding: "12px 20px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#1C1109", background: "#FDF6ED", border: "none", cursor: "pointer" }}>Cancel</button>
              <button onClick={() => handleDisburse(confirmDisburseId)} style={{ padding: "12px 24px", borderRadius: "10px", fontSize: "14px", fontWeight: 600, color: "#FFFFFF", background: "#C8521A", border: "none", cursor: "pointer", boxShadow: "0 4px 12px rgba(200,82,26,0.2)" }}>Yes, Transfer Funds</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
