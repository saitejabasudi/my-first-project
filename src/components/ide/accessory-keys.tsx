"use client";

import { Button } from "@/components/ui/button";

type AccessoryKeysProps = {
  onKeyPress: (key: string) => void;
};

export function AccessoryKeys({ onKeyPress }: AccessoryKeysProps) {
  const keys = ["(", ")", "{", "}", ";", "Tab"];

  return (
    <div className="flex h-12 flex-shrink-0 items-center gap-2 overflow-x-auto bg-card px-2 border-t">
      {keys.map((key) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          className="h-8 px-4 font-code text-lg"
          onClick={() => onKeyPress(key)}
        >
          {key === "Tab" ? "⇥" : key}
        </Button>
      ))}
    </div>
  );
}
