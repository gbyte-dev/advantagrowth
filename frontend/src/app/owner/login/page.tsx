import LoginForm from "@/features/auth/components/login-form";
import Link from "next/link";

export default function OwnerLoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-container">

        <LoginForm />

      </div>
    </main>
  );
}