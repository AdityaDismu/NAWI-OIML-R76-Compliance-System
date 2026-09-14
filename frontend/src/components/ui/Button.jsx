export default function Button({ children, variant = "primary", size = "md", className = "", ...props }) {
  const variants = {
    primary: "bg-[#1d5f8f] text-white hover:bg-[#174f78] border border-[#1d5f8f]",
    secondary: "bg-white text-[#3f566b] border border-[#cfd9e2] hover:bg-[#f5f8fa]",
    danger: "bg-[#fff4f3] text-[#b33b31] border border-[#e7c5c1] hover:bg-[#fdebea]",
    ghost: "text-[#607589] hover:bg-[#eef3f6] hover:text-[#29445d]",
    success: "bg-[#eaf6ef] text-[#1d7545] border border-[#bfe0cd] hover:bg-[#dff1e7]",
  };
  const sizes = { sm: "px-3 py-2 text-xs", md: "px-4 py-2.5 text-sm" };
  return <button className={`inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`} {...props}>{children}</button>;
}
