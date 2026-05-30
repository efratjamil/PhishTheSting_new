import React from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { getPasswordValidationState } from "../../utils/validation";

const requirementLabels = [
  {
    key: "minLength",
    label: "\u05dc\u05e4\u05d7\u05d5\u05ea 8 \u05ea\u05d5\u05d5\u05d9\u05dd",
  },
  {
    key: "uppercase",
    label:
      "\u05dc\u05e4\u05d7\u05d5\u05ea \u05d0\u05d5\u05ea \u05d2\u05d3\u05d5\u05dc\u05d4 \u05d0\u05d7\u05ea",
  },
  {
    key: "number",
    label: "\u05dc\u05e4\u05d7\u05d5\u05ea \u05de\u05e1\u05e4\u05e8 \u05d0\u05d7\u05d3",
  },
  {
    key: "special",
    label:
      "\u05dc\u05e4\u05d7\u05d5\u05ea \u05ea\u05d5 \u05de\u05d9\u05d5\u05d7\u05d3 \u05d0\u05d7\u05d3",
  },
];

export default function PasswordRequirements({ password = "" }) {
  const checks = getPasswordValidationState(password);

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-600">
        {"\u05d3\u05e8\u05d9\u05e9\u05d5\u05ea \u05e1\u05d9\u05e1\u05de\u05d4"}
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
