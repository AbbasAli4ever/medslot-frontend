import { ClinicDashboard } from "@/components/ClinicDashboard";
import { ToastProvider } from "@/components/Toast";

export default function Home() {
  return (
    <ToastProvider>
      <ClinicDashboard />
    </ToastProvider>
  );
}
