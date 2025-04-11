"use client";

import { useState, useEffect } from "react";
import CredentialButtons from "./password-manager/CredentialButtons";
import CredentialForms from "./password-manager/CredentialForms";
import DataTable from "./password-manager/DataTable.fixed";
import MasterPasswordSetup from "./password-manager/MasterPasswordSetup";

export function PasswordManager() {
  const [activeForm, setActiveForm] = useState<
    "password" | "card" | "wallet" | "note" | null
  >(null);
  const [masterPassword, setMasterPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing master password on component mount
  useEffect(() => {
    // In a client component, we can safely access localStorage
    const storedPassword =
      typeof window !== "undefined"
        ? localStorage.getItem("masterPassword")
        : null;
    if (storedPassword) {
      setMasterPassword(storedPassword);
    }
    setIsLoading(false);
  }, []);

  const handlePasswordClick = () => {
    setActiveForm("password");
  };

  const handleCardClick = () => {
    setActiveForm("card");
  };

  const handleWalletClick = () => {
    setActiveForm("wallet");
  };

  const handleNoteClick = () => {
    setActiveForm("note");
  };

  const handleCloseForm = () => {
    setActiveForm(null);
  };

  const handleSetMasterPassword = (password: string) => {
    setMasterPassword(password);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        Loading...
      </div>
    );
  }

  if (!masterPassword) {
    return <MasterPasswordSetup onPasswordSet={handleSetMasterPassword} />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Password Manager</h1>

      {!activeForm && (
        <>
          <div className="mb-6">
            <CredentialButtons
              onPasswordClick={handlePasswordClick}
              onCardClick={handleCardClick}
              onWalletClick={handleWalletClick}
              onNoteClick={handleNoteClick}
            />
          </div>
          <DataTable masterPassword={masterPassword} />
        </>
      )}

      {activeForm && (
        <div className="mb-6">
          <CredentialForms
            type={activeForm}
            onClose={handleCloseForm}
            masterPassword={masterPassword}
          />
        </div>
      )}
    </div>
  );
}
