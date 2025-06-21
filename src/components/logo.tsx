import { cn } from "@/lib/utils";
import type { SVGProps } from "react";

const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M4 22h16" />
    <path d="M6 22V6.2c0-1.2 1-2.2 2.2-2.2h7.6c1.2 0 2.2 1 2.2 2.2V14" />
    <path d="M12 4V2" />
    <path d="M12 14v-2" />
    <path d="M4 14h16" />
    <path d="m18 14 3-3" />
    <path d="m6 14-3-3" />
  </svg>
);

export default Logo;
