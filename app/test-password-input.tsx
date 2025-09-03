"use client";

import React, { useState } from "react";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordStrength } from "@/lib/utils";

export default function TestPasswordInput() {
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState<PasswordStrength | null>(null);

  const handleStrengthChange = (newStrength: PasswordStrength | null) => {
    setStrength(newStrength);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Test Password Input Strength</h1>

      <PasswordInput
        name="password"
        label="Password"
        placeholder="Enter your password"
        value={password}
        onValueChange={setPassword}
        showStrengthMeter={true}
        onStrengthChange={handleStrengthChange}
        required
      />

      <div className="mt-4">
        <h2 className="text-lg font-semibold mb-2">Current Strength:</h2>
        {strength ? (
          <div className="space-y-2">
            <p>Score: {strength.score}/4</p>
            <p>Label: {strength.label}</p>
            <p>Color: {strength.color}</p>
            <div>
              <p>Feedback:</p>
              <ul className="list-disc pl-4">
                {strength.feedback.map((msg, idx) => (
                  <li key={idx}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p>No strength data</p>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <h2 className="text-lg font-semibold">Test Cases:</h2>
        <button
          onClick={() => setPassword("")}
          className="px-3 py-1 bg-gray-200 rounded mr-2"
        >
          Empty
        </button>
        <button
          onClick={() => setPassword("abc")}
          className="px-3 py-1 bg-gray-200 rounded mr-2"
        >
          Weak
        </button>
        <button
          onClick={() => setPassword("Password123")}
          className="px-3 py-1 bg-gray-200 rounded mr-2"
        >
          Fair
        </button>
        <button
          onClick={() => setPassword("Password123@#")}
          className="px-3 py-1 bg-gray-200 rounded mr-2"
        >
          Good
        </button>
      </div>
    </div>
  );
}
