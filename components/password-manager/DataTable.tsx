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

interface Credential {
  _id?: string; // MongoDB ID
  id?: string; // In-memory ID
  type: "password" | "credit/debit" | "crypto" | "note";
  title: string;
  encryptedData: string;
  lastModified: string;
}

interface DecodedCredential extends Omit<Credential, "id" | "_id"> {
  _id?: string;
  id?: string;
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

  // Fetch credentials on component mount
  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/credentials");
      if (response.ok) {
        const data = await response.json();
        setCredentials(data);
      } else {
        setError("Failed to fetch credentials");
      }
    } catch (error) {
      setError("Error connecting to API");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      try {
        const response = await fetch(`/api/credentials/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setCredentials(
            credentials.filter((cred) => (cred._id || cred.id) !== id)
          );
        } else {
          setError("Failed to delete credential");
        }
      } catch (error) {
        setError("Error connecting to API");
      }
    }
  };

  const handleViewClick = (id: string) => {
    setSelectedCredentialId(id);
    setConfirmPassword("");
    setError(null);
    setShowPasswordConfirm(true);
  };

  const handleEditClick = async (id: string) => {
    try {
      // First decrypt the credential data to populate the edit form
      const response = await fetch(
        `/api/credentials/${id}?masterPassword=${encodeURIComponent(
          masterPassword
        )}`
      );

      if (response.ok) {
        const data = await response.json();
        setEditCredential(data);
        setIsEditing(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to edit credential");
      }
    } catch (error) {
      setError("Error connecting to API");
    }
  };

  const handleEditClose = () => {
    setEditCredential(null);
    setIsEditing(false);
    // Refresh the credentials list
    fetchCredentials();
  };

  const handleDecryptCredential = async () => {
    if (!selectedCredentialId) return;

    if (confirmPassword !== masterPassword) {
      setError("Incorrect master password");
      return;
    }

    try {
      const response = await fetch(
        `/api/credentials/${selectedCredentialId}?masterPassword=${encodeURIComponent(
          confirmPassword
        )}`
      );

      if (response.ok) {
        const data = await response.json();
        setViewCredential(data);
        setShowPasswordConfirm(false);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to view credential");
      }
    } catch (error) {
      setError("Error connecting to API");
    }
  };

  const handleCloseView = () => {
    setViewCredential(null);
    setSelectedCredentialId(null);
    setConfirmPassword("");
    setError(null);
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
                <TableRow key={item._id || item.id}>
                  <TableCell className="font-medium">
                    {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                  </TableCell>
                  <TableCell>{item.title}</TableCell>
                  <TableCell>{item.lastModified}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleViewClick(item._id || item.id || "")
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleEditClick(item._id || item.id || "")
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item._id || item.id || "")}
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

      {/* Error message */}
      {error && !showPasswordConfirm && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      {/* Password Confirmation Dialog */}
      <Dialog open={showPasswordConfirm} onOpenChange={setShowPasswordConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Master Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm">
              Please enter your master password to view this credential.
            </p>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Enter master password"
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end space-x-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleDecryptCredential}>Decrypt</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credential View Dialog */}
      <Dialog
        open={!!viewCredential}
        onOpenChange={() => viewCredential && handleCloseView()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{viewCredential?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {viewCredential?.type === "password" && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Username</p>
                  <p className="text-sm">{viewCredential.username}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Password</p>
                  <p className="text-sm">{viewCredential.password}</p>
                </div>
              </>
            )}

            {viewCredential?.type === "credit/debit" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Card Number</p>
                <p className="text-sm">
                  {viewCredential.cardNumber1} {viewCredential.cardNumber2}{" "}
                  {viewCredential.cardNumber3} {viewCredential.cardNumber4}
                </p>
              </div>
            )}

            {viewCredential?.type === "crypto" && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wallet Address</p>
                  <p className="text-sm">{viewCredential.walletAddress}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wallet Password</p>
                  <p className="text-sm">{viewCredential.walletPassword}</p>
                </div>
              </>
            )}

            {viewCredential?.type === "note" && (
              <div className="space-y-1">
                <p className="text-sm font-medium">Note</p>
                <p className="text-sm whitespace-pre-wrap">
                  {viewCredential.note}
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={handleCloseView}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
