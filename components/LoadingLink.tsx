'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NProgress from 'nprogress';
import { ComponentProps } from 'react';

export default function LoadingLink({ 
  href, 
  children, 
  ...props 
}: ComponentProps<typeof Link>) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    NProgress.start();
    router.push(href.toString());
  };

  return (
    <Link href={href} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
