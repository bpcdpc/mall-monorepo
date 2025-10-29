import clsx from "clsx";

export default function Button({
  icon,
  primary,
  full,
  size = "md",
  children,
  ...rest
}) {
  return (
    <button
      className={clsx(
        "cursor-pointer border border-[#0063ba] font-semibold flex items-center transition-colors",
        primary
          ? "bg-[#0063ba] text-white hover:bg-[#005aba]"
          : "text-[#0059a6] bg-white hover:bg-[#0063ba] hover:text-white",
        full ? "flex w-full justify-center" : "",
        size === "lg" ? "px-6 h-[60px] text-lg" : "px-4 h-[38px] text-sm "
      )}
      {...rest}
    >
      {icon && <div>{icon}</div>}
      <div>{children}</div>
    </button>
  );
}
