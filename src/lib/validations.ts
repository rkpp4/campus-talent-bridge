import { z } from "zod";

// Club validation schema
export const clubSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Club name is required")
    .max(100, "Club name must be less than 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  contact_email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters")
    .optional()
    .or(z.literal("")),
});

// Mentorship request validation schema
export const mentorshipRequestSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(1, "Topic is required")
    .max(200, "Topic must be less than 200 characters"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
});

// User profile validation schemas
export const studentProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(1000, "Bio must be less than 1000 characters")
    .optional(),
  skills: z.string().max(500, "Skills must be less than 500 characters").optional(),
  major: z.string().max(100, "Major must be less than 100 characters").optional(),
  graduation_year: z.number().int().min(2000).max(2100).optional().nullable(),
  github_url: z.string().url("Invalid URL").max(255).optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid URL").max(255).optional().or(z.literal("")),
});

export const mentorProfileSchema = z.object({
  bio: z
    .string()
    .trim()
    .max(1000, "Bio must be less than 1000 characters")
    .optional(),
  expertise: z.string().max(500, "Expertise must be less than 500 characters").optional(),
  years_of_experience: z.number().int().min(0).max(100).optional().nullable(),
  linkedin_url: z.string().url("Invalid URL").max(255).optional().or(z.literal("")),
  github_url: z.string().url("Invalid URL").max(255).optional().or(z.literal("")),
});

export const startupProfileSchema = z.object({
  company_name: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(100, "Company name must be less than 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
  industry: z.string().max(100, "Industry must be less than 100 characters").optional(),
  location: z.string().max(200, "Location must be less than 200 characters").optional(),
  website_url: z.string().url("Invalid URL").max(255).optional().or(z.literal("")),
});

// Club leader validation schema
export const clubLeaderSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Full name is required")
    .max(100, "Full name must be less than 100 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters"),
  clubId: z.string().uuid("Invalid club selection"),
});

// Message validation schema
export const messageSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be less than 5000 characters"),
});
