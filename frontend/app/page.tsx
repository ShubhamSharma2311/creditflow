import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-xl text-center space-y-6">
        <h1 style={{ color: "#C8521A", fontSize: "3rem", fontWeight: 800, letterSpacing: "-0.05em" }}>
          CreditFlow
        </h1>
        <p style={{ color: "#8C7B6B", fontSize: "1.125rem", lineHeight: 1.6 }}>
          A modern, intelligent lending platform. Manage loans from application through disbursement and collection with ease.
        </p>
        
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/login"
            style={{
              background: "#C8521A",
              color: "#FFFFFF",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
              width: "100%",
              maxWidth: "200px"
            }}
          >
            Sign In
          </Link>
          <Link 
            href="/register"
            style={{
              background: "#FFFFFF",
              color: "#C8521A",
              border: "1px solid #C8521A",
              padding: "12px 24px",
              borderRadius: "8px",
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
              width: "100%",
              maxWidth: "200px"
            }}
          >
            Create Account
          </Link>
        </div>
      </div>
    </main>
  );
}
