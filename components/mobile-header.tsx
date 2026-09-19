import Image from "next/image";
import Link from "next/link";

export const MobileHeader = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center justify-center border-b border-sky-100 bg-white/90 px-4 text-sky-900 backdrop-blur-xl lg:hidden">
      <Link href="/learn" className="flex items-center gap-2 font-extrabold">
        <Image src="/tlicho-mark.svg" alt="" width={30} height={30} />
        Tłı̨chǫ Learning
      </Link>
    </nav>
  );
};
