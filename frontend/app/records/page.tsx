"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * /records redirects to /dashboard where medical records are managed.
 * The full records UI (Medical Records, Prescriptions, file upload/delete)
 * lives on the Dashboard under the "Medical Records" and "Prescriptions" tabs.
 */
export default function RecordsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
      <p className="text-zinc-400 text-sm">Redirecting to your health dashboard...</p>
    </div>
  );
}
