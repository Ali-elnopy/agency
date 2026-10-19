export default function Brand({ href = "#", sub = false, labelClass = "" }) {
  return (
    <a href={href} className="brand">
      <span className="brand__mark" aria-hidden="true"></span>
      <span className={`brand__text ${labelClass}`.trim()}>
        <strong>ORVIA</strong>
        {sub && <small>AGENCY OS</small>}
      </span>
    </a>
  );
}
