interface TriangleIconProps {
  className?: string;
}

export default function TriangleIcon({ className = "" }: TriangleIconProps) {
  return (
    <svg
      width="16"
      height="18"
      viewBox="0 0 16 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="triangle icon"
    >
      <path
        d="M0 8.55808L15.75 -0.000291824V17.1164L0 8.55808Z"
        fill="currentColor"
      />
    </svg>
  );
}
