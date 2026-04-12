import { redirect } from "next/navigation";

import { requireViewer } from "@/lib/auth";

export default async function DashboardRedirectPage() {
  const viewer = await requireViewer();

  redirect(viewer.role === "admin" ? "/dashboard/admin" : "/dashboard/student");
}
