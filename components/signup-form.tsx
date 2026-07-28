"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  signUpWithPassword,
  type AuthActionState,
} from "@/lib/auth/actions";
import MagicLinkForm from "@/components/magic-link-form";

const initialState: AuthActionState = {};

export default function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpWithPassword,
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
            autoComplete="new-password"
            required
            minLength={8}
            className="input-field"
            placeholder="At least 8 characters"
          />
        </div>

        {state.error && (
          <p className="text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        {state.success && (
          <p className="text-sm text-green-700" role="status">
            {state.success}
          </p>
        )}

        <button type="submit" disabled={isPending} className="btn-primary w-full">
          {isPending ? "Creating account..." : "Create account"}
        </button>
      </form>

      <div className="border-t border-slate-200 pt-6">
        <h2 className="text-sm font-semibold text-slate-900">Or use a magic link</h2>
        <p className="mt-1 text-sm text-slate-500">
          Prefer passwordless sign-in? Request a one-time email link.
        </p>
        <div className="mt-4">
          <MagicLinkForm />
        </div>
      </div>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
