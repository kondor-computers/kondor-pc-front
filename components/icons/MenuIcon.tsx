interface MenuIconProps {
  className?: string;
}

export default function MenuIcon({ className = "" }: MenuIconProps) {
  return (
    <svg
      width="24"
      height="16"
      viewBox="0 0 24 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="menu icon"
    >
      <path
        d="M0 16V14.482H24V16H0ZM0 8.75901V7.24099H24V8.75901H0ZM0 1.51803V0H24V1.51803H0Z"
        fill="white"
      />
    </svg>
  );
}
