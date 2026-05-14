import Link from "next/link";

const Logo = () => {
  return (
    <Link href={"/home"}>
      <span className="gradient-text select-none flex text-xl">EliasDex</span>
    </Link>
  );
};

export default Logo;
