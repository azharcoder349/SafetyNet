import CheckInTimer from "@/components/CheckInTimer";
import SituationCopilot from "@/components/SituationCopilot";
import TrustedContacts from "@/components/TrustedContacts";
import SOSButton from "@/components/SOSButton";
import { ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="max-w-md mx-auto p-4 pb-24 relative min-h-screen flex flex-col pt-8">
      <header className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm backdrop-blur-md border border-white/30">
          <ShieldCheck size={40} className="text-blue-600 dark:text-blue-400 drop-shadow-md" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight mb-1">SafetyNet</h1>
        <p className="text-sm font-medium opacity-80">Your AI Safety Copilot</p>
      </header>

      <div className="space-y-6 flex-1">
        <CheckInTimer />
        <SituationCopilot />
        <TrustedContacts />
      </div>

      <SOSButton />

      <p className="text-center text-xs opacity-50 mt-12 mb-4">
        This app provides guidance and alerts trusted contacts. It does NOT automatically contact 911 or guarantee safety.
      </p>
    </main>
  );
}
