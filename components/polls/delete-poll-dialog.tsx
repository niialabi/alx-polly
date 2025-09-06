"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Poll } from "@/types";
import { AlertTriangle, X } from "lucide-react";

interface DeletePollDialogProps {
  poll: Poll | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pollId: string) => Promise<void>;
  isLoading?: boolean;
}

export function DeletePollDialog({
  poll,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeletePollDialogProps) {
  const [confirmText, setConfirmText] = useState("");

  const handleConfirm = async () => {
    if (!poll) return;

    try {
      await onConfirm(poll.id);
      setConfirmText("");
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    setConfirmText("");
    onClose();
  };

  if (!isOpen || !poll) {
    return null;
  }

  const isConfirmValid = confirmText.toLowerCase() === "delete";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <CardTitle className="text-red-900">Delete Poll</CardTitle>
                <CardDescription>
                  This action cannot be undone
                </CardDescription>
              </div>
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
        <CardContent className="space-y-4">
          {/* Warning Message */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-800 font-medium mb-2">
              You are about to delete:
            </div>
            <div className="text-red-700 text-sm font-medium bg-red-100 p-2 rounded">
              "{poll.title}"
            </div>
          </div>

          {/* Impact Warning */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-900">
              This will permanently delete:
            </div>
            <ul className="text-sm text-gray-700 space-y-1 ml-4">
              <li>• The poll and all its options</li>
              <li>• All votes cast on this poll ({poll.totalVotes} votes)</li>
              <li>• All associated data and statistics</li>
            </ul>
          </div>

          {/* Confirmation Input */}
          <div className="space-y-2">
            <label
              htmlFor="confirm-delete"
              className="text-sm font-medium text-gray-900"
            >
              Type <span className="font-mono font-bold">delete</span> to confirm:
            </label>
            <input
              id="confirm-delete"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Type 'delete' to confirm"
            />
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
              type="button"
              variant="destructive"
              onClick={handleConfirm}
              disabled={isLoading || !isConfirmValid}
              className="flex-1"
            >
              {isLoading ? "Deleting..." : "Delete Poll"}
            </Button>
          </div>

          {/* Additional Safety Note */}
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            This action is permanent and cannot be reversed
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
