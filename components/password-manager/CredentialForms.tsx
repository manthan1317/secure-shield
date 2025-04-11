"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { encryptData } from "@/lib/encryption";
import { v4 as uuidv4 } from "uuid";

interface CredentialFormsProps {
  type: "password" | "card" | "wallet" | "note";
  onClose: () => void;
  masterPassword: string;
}

export default function CredentialForms({
  type,
  onClose,
  masterPassword,
}: CredentialFormsProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    cardNumber1: "",
    cardNumber2: "",
    cardNumber3: "",
    cardNumber4: "",
    walletAddress: "",
    walletPassword: "",
    note: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);

    // Extract only relevant data for the credential type
    let dataToSave: any = {};

    if (type === "password") {
      dataToSave = {
        username: formData.username,
        password: formData.password,
      };
    } else if (type === "card") {
      dataToSave = {
        cardNumber1: formData.cardNumber1,
        cardNumber2: formData.cardNumber2,
        cardNumber3: formData.cardNumber3,
        cardNumber4: formData.cardNumber4,
      };
    } else if (type === "wallet") {
      dataToSave = {
        walletAddress: formData.walletAddress,
        walletPassword: formData.walletPassword,
      };
    } else if (type === "note") {
      dataToSave = {
        note: formData.note,
      };
    }

    try {
      // Encrypt the sensitive data
      const encryptedData = encryptData(
        JSON.stringify(dataToSave),
        masterPassword
      );

      // Create a new credential object
      const newCredential = {
        id: uuidv4(), // Generate a unique ID
        type,
        title,
        encryptedData,
        lastModified: new Date().toISOString(),
      };

      // Get existing credentials from localStorage
      const savedCredentials = localStorage.getItem("credentials");
      let credentials = [];

      if (savedCredentials) {
        credentials = JSON.parse(savedCredentials);
      }

      // Add the new credential
      credentials.push(newCredential);

      // Save back to localStorage
      localStorage.setItem("credentials", JSON.stringify(credentials));

      setSuccess(true);
      // Reset form after success
      setFormData({
        username: "",
        password: "",
        cardNumber1: "",
        cardNumber2: "",
        cardNumber3: "",
        cardNumber4: "",
        walletAddress: "",
        walletPassword: "",
        note: "",
      });
      setTitle("");
    } catch (error) {
      setError("Error saving credential");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    if (success) {
      // No need to reload the entire page, just close the form
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title"
          required
        />
      </div>

      {type === "password" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      )}

      {type === "card" && (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="space-y-2">
              <Label htmlFor={`cardNumber${num}`}>Card {num}</Label>
              <Input
                id={`cardNumber${num}`}
                name={`cardNumber${num}`}
                value={formData[`cardNumber${num}` as keyof typeof formData]}
                onChange={handleInputChange}
                maxLength={4}
                pattern="[0-9]{4}"
                required
              />
            </div>
          ))}
        </div>
      )}

      {type === "wallet" && (
        <>
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Crypto Address</Label>
            <Input
              id="walletAddress"
              name="walletAddress"
              value={formData.walletAddress}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletPassword">Wallet Password</Label>
            <Input
              id="walletPassword"
              name="walletPassword"
              type="password"
              value={formData.walletPassword}
              onChange={handleInputChange}
              required
            />
          </div>
        </>
      )}

      {type === "note" && (
        <div className="space-y-2">
          <Label htmlFor="note">Note</Label>
          <Textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={handleInputChange}
            required
          />
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credential Saved Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p>Your credential has been saved and encrypted.</p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
