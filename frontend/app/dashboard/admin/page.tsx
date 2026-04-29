"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getMe, logout, getAdminStats, getAllLoans, getAllUsers } from "@/lib/api";

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loans, setLoans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"loans" | "users">("loans");

  useEffect(() => {
    getMe().then(res => {
      if (res.data.user.role !== "ADMIN") {
        router.push("/login");
        return;
      }
      setUser(res.data.user);
      fetchData();
    }).catch(() => {
      router.push("/login");
    });
  }, [router]);

  async function fetchData() {
    try {
      const [statsRes, loansRes, usersRes] = await Promise.all([
        getAdminStats(),
        getAllLoans(),
        getAllUsers()
      ]);
      setStats(statsRes.data);
      setLoans(loansRes.data.loans);
      setUsers(usersRes.data.users);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#FDF6ED]">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#FDF6ED" }}>
      {/* Top Navbar */}
      <nav style={{ background: "#FFFFFF", borderBottom: "1px solid #E8DDD0", padding: "16px 32px" }} className="flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" style={{ color: "#1C1109", fontWeight: 800, fontSize: "24px", letterSpacing: "-0.5px", textDecoration: "none" }}>
            CreditFlow
          </Link>
          <span style={{ background: "#1C1109", color: "#FFFFFF", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Admin Console
          </span>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div style={{ width: 32, height: 32, borderRadius: 16, background: "#1C1109", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontWeight: 700, fontSize: "14px" }}>
              {user?.name?.charAt(0)}
            </div>
            <span style={{ color: "#1C1109", fontSize: "14px", fontWeight: 600 }}>{user?.name}</span>
            <button onClick={handleLogout} style={{ fontSize: "13px", color: "#B91C1C", fontWeight: 600, background: "none", border: "none", cursor: "pointer", marginLeft: "12px" }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-[1200px] mx-auto px-6 py-8">
        
        {/* Metric Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <MetricCard title="Total Disbursed" value={`₹${stats?.finance?.totalDisbursed?.toLocaleString() || 0}`} />
          <MetricCard title="Total Repayable" value={`₹${stats?.finance?.totalRepayable?.toLocaleString() || 0}`} />
          <MetricCard title="Total Loans" value={stats?.loans?.total || 0} sub={`${stats?.loans?.active || 0} active`} />
          <MetricCard title="Total Users" value={stats?.users?.total || 0} sub={`${stats?.users?.borrowers || 0} borrowers`} />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-[#E8DDD0] mb-6">
          <button 
            onClick={() => setActiveTab("loans")}
            style={{ 
              padding: "12px 24px", fontSize: "15px", fontWeight: 600, background: "none", cursor: "pointer",
              borderBottom: activeTab === "loans" ? "2px solid #1C1109" : "2px solid transparent",
              color: activeTab === "loans" ? "#1C1109" : "#8C7B6B"
            }}
          >
            All Loans
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            style={{ 
              padding: "12px 24px", fontSize: "15px", fontWeight: 600, background: "none", cursor: "pointer",
              borderBottom: activeTab === "users" ? "2px solid #1C1109" : "2px solid transparent",
              color: activeTab === "users" ? "#1C1109" : "#8C7B6B"
            }}
          >
            All Users
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "loans" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(28,17,9,0.03)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "#FDF6ED", borderBottom: "1px solid #E8DDD0" }}>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Borrower</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Amount</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tenure</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Applied On</th>
                </tr>
              </thead>
              <tbody>
                {loans.map(loan => (
                  <tr key={loan._id} style={{ borderBottom: "1px solid #E8DDD0" }} className="hover:bg-[#FEF0E6] transition-colors">
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#1C1109" }}>{loan.borrower?.name}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#1C1109", fontFamily: "monospace" }}>₹{loan.loanAmount.toLocaleString()}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#8C7B6B" }}>{loan.tenure} days</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: "#E8DDD0", color: "#1C1109" }}>
                        {loan.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "#8C7B6B" }}>{new Date(loan.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "users" && (
          <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(28,17,9,0.03)" }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ background: "#FDF6ED", borderBottom: "1px solid #E8DDD0" }}>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Name</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Email</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Role</th>
                  <th style={{ padding: "16px 24px", fontSize: "12px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: "1px solid #E8DDD0" }} className="hover:bg-[#FEF0E6] transition-colors">
                    <td style={{ padding: "16px 24px", fontSize: "14px", fontWeight: 600, color: "#1C1109" }}>{u.name}</td>
                    <td style={{ padding: "16px 24px", fontSize: "14px", color: "#8C7B6B" }}>{u.email}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", padding: "4px 8px", borderRadius: "4px", background: u.role === "ADMIN" ? "#1C1109" : "#E8DDD0", color: u.role === "ADMIN" ? "#FFFFFF" : "#1C1109" }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: "13px", color: "#8C7B6B" }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}

function MetricCard({ title, value, sub }: { title: string, value: string | number, sub?: string }) {
  return (
    <div style={{ background: "#FFFFFF", border: "1px solid #E8DDD0", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 20px rgba(28,17,9,0.03)" }}>
      <p style={{ fontSize: "13px", fontWeight: 700, color: "#8C7B6B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>{title}</p>
      <h3 style={{ fontSize: "28px", fontWeight: 800, color: "#1C1109", letterSpacing: "-1px" }}>{value}</h3>
      {sub && <p style={{ fontSize: "13px", color: "#8C7B6B", marginTop: "4px" }}>{sub}</p>}
    </div>
  );
}
