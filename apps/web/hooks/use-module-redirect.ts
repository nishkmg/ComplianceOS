import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useModules } from "@/hooks/use-modules";

const PATH_MODULE_MAP: [string, string][] = [
  ["/gst/", "gst"],
  ["/itr/", "itr"],
  ["/invoices", "invoicing"],
  ["/receivables", "invoicing"],
  ["/inventory", "inventory"],
  ["/payroll", "payroll"],
  ["/employees", "payroll"],
  ["/payroll-reports", "payroll"],
  ["/my-payslips", "payroll"],
];

export function useModuleRedirect() {
  const { isEnabled, loading } = useModules();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    for (const [prefix, module] of PATH_MODULE_MAP) {
      if (pathname.startsWith(prefix) && !isEnabled(module)) {
        router.push("/dashboard");
        return;
      }
    }
  }, [pathname, loading, isEnabled, router]);
}
