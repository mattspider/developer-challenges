'use client';

import { ProtegerRota } from '../../components/ProtegerRota';
import { LayoutPrincipal } from '../../components/LayoutPrincipal';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtegerRota>
      <LayoutPrincipal>{children}</LayoutPrincipal>
    </ProtegerRota>
  );
}
