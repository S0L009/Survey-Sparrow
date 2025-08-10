"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FirebaseError } from "firebase/app";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth()
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard"); // Redirect after login
    } catch (err) {
      const error = err as FirebaseError;
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
          Welcome Back
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Sign in to continue to your account
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-5">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-black font-semibold hover:underline">
            Sign Up
            </Link>
            </p>
        </div>
    </div>
    );
}
