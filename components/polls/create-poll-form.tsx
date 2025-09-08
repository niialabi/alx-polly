"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreatePollData } from "@/types";
import { X, Plus } from "lucide-react";

interface CreatePollFormProps {
  onSubmit: (data: CreatePollData) => Promise<void>;
  isLoading?: boolean;
  onSuccess?: () => void;
}

export function CreatePollForm({
  onSubmit,
  isLoading = false,
  onSuccess,
}: CreatePollFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreatePollData>({
    title: "",
    description: "",
    options: ["", ""],
    allowMultipleVotes: false,
    expiresAt: undefined,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Poll title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    }

    const validOptions = formData.options.filter(
      (option) => option.trim().length > 0,
    );
    if (validOptions.length < 2) {
      newErrors.options = "At least 2 options are required";
    }

    formData.options.forEach((option, index) => {
      if (option.trim() && option.length < 2) {
        newErrors[`option-${index}`] = "Option must be at least 2 characters";
      }
    });

    if (formData.expiresAt && new Date(formData.expiresAt) <= new Date()) {
      newErrors.expiresAt = "Expiration date must be in the future";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const validOptions = formData.options.filter(
      (option) => option.trim().length > 0,
    );
    const submitData: CreatePollData = {
      ...formData,
      options: validOptions,
      description: formData.description?.trim() || undefined,
    };

    try {
      await onSubmit(submitData);
      // Reset form on success
      setFormData({
        title: "",
        description: "",
        options: ["", ""],
        allowMultipleVotes: false,
        expiresAt: undefined,
      });
      setErrors({});
      onSuccess?.();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const addOption = () => {
    if (formData.options.length < 6) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, ""],
      }));
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));

    // Clear option error when user starts typing
    if (errors[`option-${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`option-${index}`];
      setErrors(newErrors);
    }
  };

  const handleInputChange =
    (field: keyof CreatePollData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value =
        field === "allowMultipleVotes"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        const newErrors = { ...errors };
        delete newErrors[field];
        setErrors(newErrors);
      }
    };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Poll</CardTitle>
        <CardDescription>
          Create a poll to gather opinions from your audience
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              placeholder="What's your question?"
              value={formData.title}
              onChange={handleInputChange("title")}
              disabled={isLoading}
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <textarea
              id="description"
              placeholder="Add more context to your poll..."
              value={formData.description}
              onChange={handleInputChange("description")}
              disabled={isLoading}
              rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Poll Options *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={formData.options.length >= 6 || isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>
            {formData.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    disabled={isLoading}
                    className={
                      errors[`option-${index}`] ? "border-red-500" : ""
                    }
                  />
                  {errors[`option-${index}`] && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors[`option-${index}`]}
                    </p>
                  )}
                </div>
                {formData.options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                    disabled={isLoading}
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {errors.options && (
              <p className="text-sm text-red-500">{errors.options}</p>
            )}
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowMultipleVotes"
                checked={formData.allowMultipleVotes}
                onChange={handleInputChange("allowMultipleVotes")}
                disabled={isLoading}
                className="h-4 w-4"
              />
              <Label htmlFor="allowMultipleVotes">
                Allow multiple votes per user
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
              <Input
                id="expiresAt"
                type="datetime-local"
                value={
                  formData.expiresAt
                    ? new Date(formData.expiresAt).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiresAt: e.target.value
                      ? new Date(e.target.value)
                      : undefined,
                  }))
                }
                disabled={isLoading}
                className={errors.expiresAt ? "border-red-500" : ""}
              />
              {errors.expiresAt && (
                <p className="text-sm text-red-500">{errors.expiresAt}</p>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => router.push("/polls")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating Poll..." : "Create Poll"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
