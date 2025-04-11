"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface MasterPasswordSetupProps {
  onPasswordSet: (password: string) => void;
}

export default function MasterPasswordSetup({
  onPasswordSet,
}: MasterPasswordSetupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      setError("Password is required");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Store the password in localStorage for this demo
    // In a real app, you might use a more secure approach
    localStorage.setItem("masterPassword", password);
    onPasswordSet(password);
  };

  return (
    <div className="max-w-md mx-auto bg-card border rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Set Master Password</h2>
      <p className="text-sm text-muted-foreground mb-6">
        This password will be used to encrypt and decrypt all your credentials.
        Make sure it's secure and you remember it - if you lose this password,
        you won't be able to access your stored credentials.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Master Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter master password"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Master Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm master password"
            required
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full">
          Set Password
        </Button>
      </form>
    </div>
  );
}
