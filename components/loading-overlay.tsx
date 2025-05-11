import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  opacity?: number;
}

export function LoadingOverlay({ 
  isLoading, 
  message = "Loading...", 
  opacity = 0.8 
}: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{ backgroundColor: `rgba(15, 18, 25, ${opacity})` }}
    >
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#6366f1]" />
        <p className="text-white font-medium">{message}</p>
      </div>
    </div>
  );
}
