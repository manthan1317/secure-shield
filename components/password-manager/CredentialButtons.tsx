"use client";

import { Button } from "@/components/ui/button";
import { Key, CreditCard, Wallet, StickyNote } from "lucide-react";

interface CredentialButtonsProps {
  onPasswordClick: () => void;
  onCardClick: () => void;
  onWalletClick: () => void;
  onNoteClick: () => void;
}

export default function CredentialButtons({
  onPasswordClick,
  onCardClick,
  onWalletClick,
  onNoteClick,
}: CredentialButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={onPasswordClick}
      >
        <Key className="h-6 w-6" />
        <span>Password</span>
      </Button>
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={onCardClick}
      >
        <CreditCard className="h-6 w-6" />
        <span>Credit/Debit Card</span>
      </Button>
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={onWalletClick}
      >
        <Wallet className="h-6 w-6" />
        <span>Crypto Wallet</span>
      </Button>
      <Button
        variant="outline"
        className="h-24 flex flex-col items-center justify-center gap-2"
        onClick={onNoteClick}
      >
        <StickyNote className="h-6 w-6" />
        <span>Save Note</span>
      </Button>
    </div>
  );
}
