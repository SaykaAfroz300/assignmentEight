"use client";

import { useId, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  error?: string | null;
  hint?: React.ReactNode;
};

export default function PasswordInput({ label, error, hint, id, className = "", ...rest }: Props) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold">
        {label}
      </label>
      <div className="relative">
        <Lock size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base-content/45" />
        <input
          {...rest}
          id={inputId}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`field !pl-11 !pr-12 ${error ? "!border-error" : ""} ${className}`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-base-content/55 transition hover:bg-base-content/10 hover:text-base-content"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <p id={`${inputId}-error`} role="alert" className="mt-2 text-sm text-error">
          {error}
        </p>
      )}
      {hint}
    </div>
  );
}
