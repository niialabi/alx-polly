"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Poll } from "@/types";
import { X } from "lucide-react";

interface EditPollDialogProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pollId: string, data: { title: string; expiresAt?: Date }) => Promise<void>;
  isLoading?: boolean;
}

export function EditPollDialog({
  poll,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: EditPollDialogProps) {
  const [title, setTitle] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (poll) {
      setTitle(poll.title);
      setExpiresAt(
        poll.expiresAt
          ? new Date(poll.expiresAt).toISOString().slice(0, 16)
          : ""
      );
      setErrors({});
    }
  }, [poll]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Poll title is required";
    } else if (title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    if (expiresAt && new Date(expiresAt) <= new Date()) {
      newErrors.expiresAt = "Expiration date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poll || !validateForm()) {
      return;
    }

    try {
      await onSave(poll.id, {
        title: title.trim(),
        expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      });
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!isOpen || !poll) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Edit Poll</CardTitle>
              <CardDescription>
                Make changes to your poll details
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">Poll Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }
                }}
                disabled={isLoading}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label htmlFor="edit-expires-at">
                Expiration Date (Optional)
              </Label>
              <Input
                id="edit-expires-at"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => {
                  setExpiresAt(e.target.value);
                  if (errors.expiresAt) {
                    setErrors((prev) => ({ ...prev, expiresAt: "" }));
                  }
                }}
                disabled={isLoading}
                className={errors.expiresAt ? "border-red-500" : ""}
              />
              {errors.expiresAt && (
                <p className="text-sm text-red-500">{errors.expiresAt}</p>
              )}
            </div>

            {/* Note about options */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Poll options cannot be edited once votes
                have been cast to maintain data integrity.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
