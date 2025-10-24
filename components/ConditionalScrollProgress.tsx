"use client";

import { usePathname } from 'next/navigation';
import ScrollProgress from './ScrollProgress';

export default function ConditionalScrollProgress() {
  const pathname = usePathname();
  if (!pathname) return null;
  const hideOn = ['/sign-in', '/sign-up'];
  if (hideOn.includes(pathname)) return null;
  return <ScrollProgress />;
}
