import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ReactNode } from "react";

export async function ServerAuthCheck({ children }: { children: ReactNode }) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  if (!session.user.onboardingComplete) {
    redirect("/onboarding");
  }

  return <>{children}</>;
}
