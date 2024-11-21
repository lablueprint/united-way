"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function Home() {
  const router : AppRouterInstance = useRouter();
  useEffect(() => {
    router.push("landing");
  }, []);

  return (
    <>
    </>
  );
}
