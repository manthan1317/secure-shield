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

interface Credential {
  id: string;
  type: "password" | "credit/debit" | "crypto" | "note";
  title: string;
  username?: string;
  password?: string;
  cardNumber1?: string;
  cardNumber2?: string;
  cardNumber3?: string;
  cardNumber4?: string;
  walletAddress?: string;
  walletPassword?: string;
  note?: string;
  lastModified: string;
}

interface CredentialEditFormProps {
  credential: Credential;
  masterPassword: string;
  onClose: () => void;
  onUpdate: (updatedCredential: Credential) => void;
}

export default function CredentialEditForm({
  credential,
  masterPassword,
  onClose,
  onUpdate,
}: CredentialEditFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [title, setTitle] = useState(credential.title);
  const [formData, setFormData] = useState({
    username: credential.username || "",
    password: credential.password || "",
    cardNumber1: credential.cardNumber1 || "",
    cardNumber2: credential.cardNumber2 || "",
    cardNumber3: credential.cardNumber3 || "",
    cardNumber4: credential.cardNumber4 || "",
    walletAddress: credential.walletAddress || "",
    walletPassword: credential.walletPassword || "",
    note: credential.note || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create updated credential object
      const updatedCredential: Credential = {
        ...credential,
        title,
        ...formData,
        lastModified: new Date().toISOString(),
      };

      // Call the parent component's update function
      onUpdate(updatedCredential);
      setSuccess(true);
    } catch (error) {
      setError("Error updating credential");
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

      {credential.type === "password" && (
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

      {credential.type === "card" && (
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

      {credential.type === "wallet" && (
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

      {credential.type === "note" && (
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
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </div>

      {/* Success Dialog */}
      <Dialog open={success} onOpenChange={setSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Credential Updated Successfully</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p>Your credential has been updated and encrypted.</p>
            <div className="flex justify-end">
              <Button onClick={handleClose}>Close</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </form>
  );
}
