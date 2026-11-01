import { Check, X } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/validation";

/** Live checklist for the three password rules. */
export default function PasswordChecklist({ password }: { password: string }) {
  return (
    <ul className="mt-3 grid gap-1.5" aria-label="Password requirements">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.id} className={`flex items-center gap-2 text-xs transition-colors ${ok ? "text-success" : "text-base-content/55"}`}>
            <span className={`grid size-4 place-items-center rounded-full ${ok ? "bg-success/20" : "bg-base-content/10"}`}>
              {ok ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
