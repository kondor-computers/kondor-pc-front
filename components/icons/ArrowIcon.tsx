interface ArrowIconProps {
  className?: string;
}

export default function ArrowIcon({ className = "" }: ArrowIconProps) {
  return (
    <svg
      width="16"
      height="24"
      viewBox="0 0 16 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="arrow icon"
    >
      <path
        d="M8.60227 18L7.72727 17.1364L11.3295 13.5341H2V12.2841H11.3295L7.72727 8.69318L8.60227 7.81818L13.6932 12.9091L8.60227 18Z"
        fill="currentColor"
      />
    </svg>
  );
}
