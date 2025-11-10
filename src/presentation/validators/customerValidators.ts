import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    firstName: z
      .string({ required_error: "First name is required" })
      .min(1, "First name is required")
      .max(50, "First name must not exceed 50 characters")
      .trim(),
    lastName: z
      .string({ required_error: "Last name is required" })
      .min(1, "Last name is required")
      .max(50, "Last name must not exceed 50 characters")
      .trim(),
    email: z
      .string({ required_error: "Email is required" })
      .email("Invalid email format")
      .max(100, "Email must not exceed 100 characters")
      .toLowerCase()
      .trim(),
    phoneNumber: z
      .string()
      .max(12, "Phone number must not exceed 12 digits")
      .trim()
      .optional()
      .or(z.literal("")),
    address: z
      .string()
      .max(200, "Address must not exceed 200 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    city: z
      .string()
      .max(50, "City must not exceed 50 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    state: z
      .string()
      .max(50, "State must not exceed 50 characters")
      .trim()
      .optional()
      .or(z.literal("")),
    country: z
      .string()
      .max(50, "Country must not exceed 50 characters")
      .trim()
      .optional()
      .or(z.literal("")),
  }),
});

export const updateCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid customer ID format"),
  }),
  body: z
    .object({
      firstName: z
        .string()
        .min(1, "First name cannot be empty")
        .max(50, "First name must not exceed 50 characters")
        .trim()
        .optional(),
      lastName: z
        .string()
        .min(1, "Last name cannot be empty")
        .max(50, "Last name must not exceed 50 characters")
        .trim()
        .optional(),
      email: z
        .string()
        .email("Invalid email format")
        .max(100, "Email must not exceed 100 characters")
        .toLowerCase()
        .trim()
        .optional(),
      phoneNumber: z
        .string()
        .max(12, "Phone number must not exceed 12 digits")
        .trim()
        .optional()
        .or(z.literal("")),
      address: z
        .string()
        .max(200, "Address must not exceed 200 characters")
        .trim()
        .optional()
        .or(z.literal("")),
      city: z
        .string()
        .max(50, "City must not exceed 50 characters")
        .trim()
        .optional()
        .or(z.literal("")),
      state: z
        .string()
        .max(50, "State must not exceed 50 characters")
        .trim()
        .optional()
        .or(z.literal("")),
      country: z
        .string()
        .max(50, "Country must not exceed 50 characters")
        .trim()
        .optional()
        .or(z.literal("")),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

export const getCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid customer ID format"),
  }),
});

export const getAllCustomersSchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 50))
      .refine((val) => val >= 1 && val <= 100, {
        message: "Limit must be between 1 and 100",
      }),
    offset: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 0))
      .refine((val) => val >= 0, {
        message: "Offset must be non-negative",
      }),
  }),
});

export const deleteCustomerSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid customer ID format"),
  }),
});
