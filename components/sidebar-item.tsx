"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

type SidebarItemProps = {
  label: string;
  iconSrc?: string;
  icon?: LucideIcon;
  href: string;
};

export const SidebarItem = ({
  label,
  iconSrc,
  icon: Icon,
  href,
}: SidebarItemProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Button
      variant={isActive ? "sidebarOutline" : "sidebar"}
      className="h-[52px] justify-start"
      asChild
    >
      <Link href={href} prefetch>
        {iconSrc && (
          <Image src={iconSrc} alt="" className="mr-5" height={32} width={32} />
        )}
        {Icon && <Icon className="mr-5 h-7 w-7" aria-hidden />}
        {label}
      </Link>
    </Button>
  );
};
