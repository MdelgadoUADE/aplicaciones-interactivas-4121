import { Link } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

const VARIANTS = {
  primary: "bg-brand-terracotta text-white hover:bg-brand-dark",
  secondary: "border border-stone-300 bg-white text-stone-800 hover:border-brand-terracotta hover:text-brand-terracotta",
  ghost: "text-stone-700 hover:bg-stone-100 hover:text-brand-terracotta",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
};

// Si recibe `to` se renderiza como <Link>; si no, como <button>.
export default function Button({
  variant = "primary",
  size = "md",
  to,
  loading = false,
  disabled = false,
  className = "",
  children,
  ...rest
}) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} disabled={disabled || loading} {...rest}>
      {loading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  );
}