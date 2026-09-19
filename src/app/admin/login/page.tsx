import Link from "next/link";
import LoginForm from "./LoginForm";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0E1F1A] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-block mb-4 text-sm text-[#F6F3EA]/60 hover:text-[#F6F3EA] transition-colors"
        >
          ← Back to Lunchtime Football
        </Link>
        <div className="text-center mb-6">
          <h1 className="font-display text-xl font-semibold text-[#F6F3EA]">Lunchtime Football</h1>
          <p className="text-sm text-[#F6F3EA]/60 mt-1">Admin dashboard</p>
        </div>
        <div className="card p-6">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
