"use client";

import React, { useRef } from "react";
import { Input } from "@/components/ui/input";

interface PinInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function PinInput({ value, onChange, length = 4 }: PinInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newPin = value.split("");
    newPin[index] = e.target.value;
    onChange(newPin.join(""));

    if (e.target.value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-3">
      {Array.from({ length }).map((_, i) => (
        <Input
          key={i}
          ref={(el) => (inputRefs.current[i] = el)}
          type="password"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="h-16 w-14 text-center text-3xl font-bold"
          pattern="[0-9]*"
          inputMode="numeric"
        />
      ))}
    </div>
  );
}
