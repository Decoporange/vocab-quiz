import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outlined";
}

export default function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const variantClass = variant === "primary" ? "btn-primary" : "btn-outlined";
  return <button className={["btn", variantClass, className].filter(Boolean).join(" ")} {...rest} />;
}
