import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "text";
type ButtonSize = "lg" | "md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-primary-500 text-white border-transparent",
    "hover:bg-primary-600",
    "disabled:bg-primary-100 disabled:text-primary-300",
  ].join(" "),
  secondary: [
    "bg-transparent text-primary-500 border border-primary-500",
    "hover:bg-primary-100",
    "disabled:opacity-40",
  ].join(" "),
  tertiary: [
    "bg-white text-neutral-900 border border-neutral-200",
    "hover:bg-neutral-50",
    "disabled:opacity-40",
  ].join(" "),
  text: [
    "bg-transparent text-primary-500 border-transparent",
    "hover:underline",
    "disabled:opacity-40",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  lg: "h-11 px-4 text-[14px]",
  md: "h-11 px-3 text-[14px]",
};

export function Button({
  variant = "primary",
  size = "lg",
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium rounded-[var(--radius-md)]",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:pointer-events-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {children}
    </button>
  );
}
