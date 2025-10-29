import clsx from "clsx";

export default function ProductBadges({
  badges,
  containerClass = "flex flex-col gap-1",
}) {
  return (
    <div className={containerClass}>
      {badges.map((b) => (
        <div
          key={b}
          className={clsx(
            "block w-fit text-white text-[8pt] font-bold px-2 py-0.5",
            {
              "bg-[#203864]": b === "NEW",
              "bg-[#0063ba]": b === "BEST",
              "bg-[#b30101]": b === "온라인 전용",
              "bg-[#3B3838]": b === "TV CF",
            }
          )}
        >
          {b}
        </div>
      ))}
    </div>
  );
}
