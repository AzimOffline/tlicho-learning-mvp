import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { getPublicAppEnvironment } from "./env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function absoluteUrl(path: string) {
  const { appUrl } = getPublicAppEnvironment();

  return `${appUrl}${path}`;
}
