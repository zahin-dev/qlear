import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "default" | "small" | "large";
  children: ReactNode;
}

export function Button({ variant = "primary", size = "default", className = "", children, ...props }: ButtonProps) {
  return <button className={`button button--${variant} button--${size} ${className}`} {...props}>{children}</button>;
}
