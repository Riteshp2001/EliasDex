import Link from "next/link";

const Logo = () => {
  return (
    <Link href={"/home"}>
      <h1 className="gradient-text select-none flex text-xl">EliasDex</h1>
    </Link>
  );
};

export default Logo;
