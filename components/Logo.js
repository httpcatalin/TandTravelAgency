import Link from "next/link";
import Image from "next/image";

export function Logo({ worldFill, otherFill, className }) {
  return (
    <Link aria-label={"Tand Travel Logo logo. Click to go to home page"} href={"/"}>
      <Image
        src={"/images/logo.png"}
        alt="Tand Travel Logo"
        width={120}
        height={40}
      className={"object-contain" + " " + (className ? className : "")}
      />
    </Link>
  );
}
