import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(1, "Password is required"),
});

export const signupSchema = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username is too long"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email address")
            .max(254, "Email is too long"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, "Email is required")
        .email("Enter a valid email address")
        .max(254, "Email is too long")
        .transform((v) => v.trim().toLowerCase()),
});


export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
