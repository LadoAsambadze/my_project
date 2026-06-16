import { z } from "zod"

// Validation rules mirror the backend (see design/DESIGN.md):
//   email    — required, valid email
//   password — register: >= 8 chars; login: required
//   name     — optional, <= 80
//   bio      — optional, <= 280
//   location — optional, <= 120
//   avatarUrl — optional; valid http(s) URL, <= 2048 when present

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Enter a valid email address")

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  name: z
    .string()
    .max(80, "Name must be 80 characters or fewer")
    .optional()
    .or(z.literal("")),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters"),
})

// An optional http(s) URL: blank is allowed, otherwise must be a valid URL.
const optionalHttpUrl = z
  .string()
  .max(2048, "URL must be 2048 characters or fewer")
  .refine(
    (value) => {
      if (value.trim() === "") return true
      try {
        const parsed = new URL(value)
        return parsed.protocol === "http:" || parsed.protocol === "https:"
      } catch {
        return false
      }
    },
    { message: "Enter a valid http(s) URL" }
  )

export const profileSchema = z.object({
  name: z.string().max(80, "Name must be 80 characters or fewer"),
  bio: z.string().max(280, "Bio must be 280 characters or fewer"),
  location: z.string().max(120, "Location must be 120 characters or fewer"),
  avatarUrl: optionalHttpUrl,
})

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
export type ProfileValues = z.infer<typeof profileSchema>
