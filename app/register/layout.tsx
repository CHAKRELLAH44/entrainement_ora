import { Suspense } from "react";

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
}



// https://ton-app.netlify.app/register?code=BLABLA2026