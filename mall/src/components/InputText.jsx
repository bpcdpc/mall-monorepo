export default function InputText({ w, ...rest }) {
  return (
    <input
      type="text"
      style={{ width: w || "auto" }}
      className="min-w-[150px] text-sm rounded border border-gray-200 bg-white px-4 py-2 pr-8 "
      {...rest}
    />
  );
}
