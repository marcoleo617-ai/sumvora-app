"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signInWithPassword,
  type AuthActionState,
} from "@/lib/auth/actions";
import MagicLinkForm from "@/components/magic-link-form";

const initialState: AuthActionState = {};

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(
    signInWithPassword,
    initialState,
  );

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="input-field"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="input-field"
            placeholder="Your password"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-900">Or use a magic link</h2>
        <p className="mt-1 text-sm text-slate-500">
          We will email you a sign-in link. No password needed.
        </p>
        <div className="mt-4">
          <MagicLinkForm />
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign up
        </Link>
      </p>
    </div>
  );
}
