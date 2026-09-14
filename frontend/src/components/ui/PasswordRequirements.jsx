import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { getPasswordValidationState } from "../../utils/validation";

const requirementLabels = [
  {
    key: "minLength",
    label: "לפחות 8 תווים",
  },
  {
    key: "uppercase",
    label:
      "לפחות אות גדולה אחת",
  },
  {
    key: "number",
    label: "לפחות מספר אחד",
  },
  {
    key: "special",
    label:
      "לפחות תו מיוחד אחד",
  },
];

export default function PasswordRequirements({ password = "" }) {
  const checks = getPasswordValidationState(password);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
        דרישות סיסמה
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {requirementLabels.map((requirement) => {
          const passed = checks[requirement.key];
          const Icon = passed ? CheckCircleIcon : XCircleIcon;

          return (
            <div
              key={requirement.key}
              className={`flex items-center gap-2 text-xs sm:text-sm ${
                passed ? "text-green-700" : "text-gray-500"
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  passed ? "text-green-600" : "text-gray-300"
                }`}
              />
              <span>{requirement.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
