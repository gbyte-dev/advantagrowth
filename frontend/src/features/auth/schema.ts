import { z } from "zod";

export const registerSchema = z
  .object({
    owner_name: z.string().min(3),
    restaurant_name: z.string().min(3),
    email: z.email(),
    phone: z.string().min(10),
    password: z.string().min(8),
    password_confirmation: z.string().min(8),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export type RegisterSchema = z.infer<typeof registerSchema>;