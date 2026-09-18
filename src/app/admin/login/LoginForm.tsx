"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "@/app/actions/admin";

const initialState = { ok: false, error: "" };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? "Signing in…" : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useFormState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Username</label>
        <input
          name="username"
          required
          autoFocus
          className="mt-1.5 w-full rounded-md border border-[#cfc7b2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E1F1A]/30"
        />
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-[#8a8471]">Password</label>
        <input
          type="password"
          name="password"
          required
          className="mt-1.5 w-full rounded-md border border-[#cfc7b2] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E1F1A]/30"
        />
      </div>
      {state?.error && <p className="text-sm text-[#8A4A2E]">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}
