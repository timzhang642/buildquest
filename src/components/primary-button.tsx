import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "small";
  disabled?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  href?: string;
  className?: string;
};

const variants = {
  primary:
    "py-3 px-8 bg-amber-500 text-charcoal-900 rounded-xl font-bold text-base hover:bg-amber-400 disabled:opacity-50 transition",
  secondary:
    "py-3 px-8 bg-white text-charcoal-900 rounded-xl font-semibold text-base border border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 disabled:opacity-50 transition",
  small:
    "py-2 px-4 bg-amber-500 text-charcoal-900 rounded-lg font-semibold text-sm hover:bg-amber-400 disabled:opacity-50 transition",
};

export function PrimaryButton({
  children,
  variant = "primary",
  disabled,
  type = "button",
  onClick,
  href,
  className = "",
}: ButtonProps) {
  const classes = `${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={classes}
    >
      {children}
    </button>
  );
}
