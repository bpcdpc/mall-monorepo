export default function Board({ heads, rows }) {
  return (
    <div>
      {heads?.map((h) => (
        <div key={h}>h</div>
      ))}
      {rows?.map((r) => (
        <div key={r}>r</div>
      ))}
    </div>
  );
}
