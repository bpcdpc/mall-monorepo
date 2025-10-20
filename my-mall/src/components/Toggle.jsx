import { useState } from "react";

export default function Toggle({
  initial = false,
  onChange,
  label = ["OFF", "ON"], // [꺼졌을 때, 켜졌을 때]
}) {
  const [enabled, setEnabled] = useState(initial);

  const toggle = () => {
    const newVal = !enabled;
    setEnabled(newVal);
    onChange?.(newVal);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* 라벨 */}
      <span>{enabled ? label[1] : label[0]}</span>

      {/* 토글 스위치 */}
      <button
        type="button"
        onClick={toggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full
          transition-colors duration-300
          ${enabled ? "bg-[#0063ba]" : "bg-gray-300"}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white
            transition-transform duration-300
            ${enabled ? "translate-x-6" : "translate-x-1"}
          `}
        />
      </button>
    </div>
  );
}
