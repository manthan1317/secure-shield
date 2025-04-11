"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import CredentialEditForm from "./CredentialEditForm";
import { v4 as uuidv4 } from "uuid";
import { encryptData, decryptData } from "@/lib/encryption"; // Assuming you have these utilities

// Define credential interfaces with unique ID support
interface Credential {
  id: string; // Unique identifier
  type: "password" | "credit/debit" | "crypto" | "note";
  title: string;
  encryptedData: string;
  lastModified: string;
}

interface DecodedCredential extends Omit<Credential, "encryptedData"> {
  username?: string;
  password?: string;
  cardNumber1?: string;
  cardNumber2?: string;
  cardNumber3?: string;
  cardNumber4?: string;
  walletAddress?: string;
  walletPassword?: string;
  note?: string;
}

interface DataTableProps {
  masterPassword: string;
}

export default function DataTable({ masterPassword }: DataTableProps) {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewCredential, setViewCredential] =
    useState<DecodedCredential | null>(null);
  const [selectedCredentialId, setSelectedCredentialId] = useState<
    string | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [editCredential, setEditCredential] =
    useState<DecodedCredential | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch credentials from localStorage on component mount
  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = () => {
    setLoading(true);
    try {
      const savedCredentials = localStorage.getItem("credentials");
      if (savedCredentials) {
        setCredentials(JSON.parse(savedCredentials));
      } else {
        // Initialize empty array if no credentials exist
        localStorage.setItem("credentials", JSON.stringify([]));
        setCredentials([]);
      }
    } catch (error) {
      setError("Error reading credentials from storage");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      try {
        const updatedCredentials = credentials.filter((cred) => cred.id !== id);
        localStorage.setItem("credentials", JSON.stringify(updatedCredentials));
        setCredentials(updatedCredentials);
      } catch (error) {
        setError("Failed to delete credential");
      }
    }
  };

  const handleViewClick = (id: string) => {
    setSelectedCredentialId(id);
    setConfirmPassword("");
    setError(null);
    setShowPasswordConfirm(true);
  };

  const handleEditClick = (id: string) => {
    try {
      const credential = credentials.find((cred) => cred.id === id);
      if (!credential) {
        setError("Credential not found");
        return;
      }

      try {
        // Decrypt the credential data using the master password
        const decryptedData = JSON.parse(
          decryptData(credential.encryptedData, masterPassword)
        );

        // Create decoded credential with all fields
        const decodedCredential: DecodedCredential = {
          id: credential.id,
          type: credential.type,
          title: credential.title,
          lastModified: credential.lastModified,
          ...decryptedData,
        };

        setEditCredential(decodedCredential);
        setIsEditing(true);
      } catch (error) {
        setError(
          "Failed to decrypt the credential. Incorrect master password."
        );
      }
    } catch (error) {
      setError("Error accessing credential");
    }
  };

  const handleEditClose = () => {
    setEditCredential(null);
    setIsEditing(false);
    // Refresh the credentials list
    fetchCredentials();
  };

  const handleDecryptCredential = () => {
    if (!selectedCredentialId) return;

    if (confirmPassword !== masterPassword) {
      setError("Incorrect master password");
      return;
    }

    try {
      const credential = credentials.find(
        (cred) => cred.id === selectedCredentialId
      );
      if (!credential) {
        setError("Credential not found");
        return;
      }

      try {
        // Decrypt the credential data using the provided password
        const decryptedData = JSON.parse(
          decryptData(credential.encryptedData, confirmPassword)
        );

        // Create decoded credential with all fields
        const decodedCredential: DecodedCredential = {
          id: credential.id,
          type: credential.type,
          title: credential.title,
          lastModified: credential.lastModified,
          ...decryptedData,
        };

        setViewCredential(decodedCredential);
        setShowPasswordConfirm(false);
        setError(null);
      } catch (error) {
        setError(
          "Failed to decrypt the credential. Incorrect master password."
        );
      }
    } catch (error) {
      setError("Error accessing credential");
    }
  };

  const handleCloseView = () => {
    setViewCredential(null);
    setSelectedCredentialId(null);
    setConfirmPassword("");
    setError(null);
  };

  // Handle updating a credential
  const handleUpdateCredential = (updatedCredential: DecodedCredential) => {
    try {
      // Extract sensitive data to encrypt
      const { id, type, title, lastModified, ...sensitiveData } =
        updatedCredential;

      // Encrypt sensitive data
      const encryptedData = encryptData(
        JSON.stringify(sensitiveData),
        masterPassword
      );

      // Create updated credential object
      const credential: Credential = {
        id,
        type,
        title,
        encryptedData,
        lastModified: new Date().toISOString(),
      };

      // Update credentials in localStorage
      const updatedCredentials = credentials.map((cred) =>
        cred.id === id ? credential : cred
      );

      localStorage.setItem("credentials", JSON.stringify(updatedCredentials));
      setCredentials(updatedCredentials);
      setIsEditing(false);
      setEditCredential(null);
    } catch (error) {
      setError("Failed to update credential");
    }
  };

  if (isEditing && editCredential) {
    // Show the edit form when editing a credential
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Edit {editCredential.title}
        </h2>
        <CredentialEditForm
          credential={editCredential}
          masterPassword={masterPassword}
          onClose={handleEditClose}
          onUpdate={handleUpdateCredential}
        />
      </div>
    );
  }

  return (
    <div>
      {loading ? (
        <div className="text-center py-4">Loading credentials...</div>
      ) : credentials.length === 0 ? (
        <div className="text-center py-4">No credentials found</div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Last Modified</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credentials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>
                    {new Date(item.lastModified).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewClick(item.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(item.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Password confirmation dialog */}
      <Dialog open={showPasswordConfirm} onOpenChange={setShowPasswordConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Master Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm">
              Enter your master password to view this credential
            </p>
            <Input
              type="password"
              placeholder="Master Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {error && (
              <div className="text-sm text-red-500 font-medium">{error}</div>
            )}
            <div className="flex justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleDecryptCredential}>Confirm</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credential view dialog */}
      <Dialog open={viewCredential !== null} onOpenChange={handleCloseView}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewCredential?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewCredential?.type === "password" && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Username</p>
                  <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    {viewCredential.username}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Password</p>
                  <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    {viewCredential.password}
                  </p>
                </div>
              </>
            )}

            {viewCredential?.type === "credit/debit" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Card Number</p>
                <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                  {viewCredential.cardNumber1}-{viewCredential.cardNumber2}-
                  {viewCredential.cardNumber3}-{viewCredential.cardNumber4}
                </p>
              </div>
            )}

            {viewCredential?.type === "crypto" && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wallet Address</p>
                  <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md break-all">
                    {viewCredential.walletAddress}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wallet Password</p>
                  <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md">
                    {viewCredential.walletPassword}
                  </p>
                </div>
              </>
            )}

            {viewCredential?.type === "note" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Note</p>
                <p className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-md whitespace-pre-wrap">
                  {viewCredential.note}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <DialogClose asChild>
                <Button>Close</Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
