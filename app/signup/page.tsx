"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { FirebaseError } from "firebase/app";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      const error = err as FirebaseError;
      console.error("Firebase Signup Error:", error);
      setError("Failed to create account. Please try again.");
      console.error(`Error Code: ${error.code}, Message: ${error.message}`);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-white">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 text-center mb-6">
          Create Account
        </h1>
        <p className="text-gray-500 text-center mb-8">
          Start your journey with us
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-5">
          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Password Input with Show/Hide */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-4 py-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-black focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black font-semibold hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
