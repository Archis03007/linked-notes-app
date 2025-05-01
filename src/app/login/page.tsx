"use client";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";

export default function LoginPage() {
  const { setUsername } = useAuth();
  useEffect(() => {
    setUsername("");
  }, [setUsername]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="mb-16 flex flex-col items-center">
        <div className="text-4xl font-extrabold tracking-tight text-violet-600 mb-2">Lynkrr</div>
        <div className="text-zinc-400 text-base font-medium italic">Your Mind, Upgraded.</div>
      </div>
      <h1 className="text-2xl font-bold mb-8">Login</h1>
      <AuthForm mode="login" />
      <p className="mt-8 text-sm">
        Don&apos;t have an account? <Link href="/register" className="text-blue-600 hover:underline ml-2">Register</Link>
      </p>
    </div>
  );
} 