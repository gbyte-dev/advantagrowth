import RegisterForm from "@/features/auth/components/register-form";
import Link from "next/link";

export default function OwnerRegisterPage() {
  return (
    <main className="auth-page">
      <div className="auth-container">

        <RegisterForm />

      </div>
    </main>
  );
}