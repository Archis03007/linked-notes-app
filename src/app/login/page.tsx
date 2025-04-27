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
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <AuthForm mode="login" />
      <p className="mt-4 text-sm">
        Don&apos;t have an account? <Link href="/register" className="text-blue-600 hover:underline">Register</Link>
      </p>
    </div>
  );
} 