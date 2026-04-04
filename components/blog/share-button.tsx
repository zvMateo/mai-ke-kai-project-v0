"use client";

import { useState } from "react";
import { Link2, Check } from "lucide-react";

interface ShareButtonProps {
  label: string;
  copyLabel: string;
  copiedLabel: string;
}

export function ShareButton({ label, copyLabel, copiedLabel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = window.location.href;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto"
      title={label}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-500" />
          <span className="text-green-600 text-xs font-medium">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          <span className="text-xs">{copyLabel}</span>
        </>
      )}
    </button>
  );
}
