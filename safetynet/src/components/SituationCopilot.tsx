"use client";

import { useState } from "react";
import { Send, ShieldAlert, CheckCircle, AlertTriangle, Info, Bot } from "lucide-react";
import { useSafetyContext } from "@/context/SafetyContext";
import { useGeolocation } from "@/hooks/useGeolocation";

interface RiskBrief {
  riskLevel: "Low" | "Moderate" | "High";
  concerns: string[];
  recommendedActions: string[];
  shouldEscalate: boolean;
  source: "ai" | "heuristic";
}

export default function SituationCopilot() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [brief, setBrief] = useState<RiskBrief | null>(null);
  const { setAppState } = useSafetyContext();
  const { location } = useGeolocation();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setLoading(true);
    setBrief(null);
    try {
      const res = await fetch("/api/analyze-situation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          situationText: text,
          timeOfDay: new Date().toLocaleTimeString(),
          locationLabel: location.latitude ? `${location.latitude}, ${location.longitude}` : "Unknown",
        }),
      });

      if (!res.ok) throw new Error("API failed");
      const data: RiskBrief = await res.json();
      setBrief(data);
      
      if (data.riskLevel === "High" || data.shouldEscalate) {
        setAppState("Alert");
      } else if (data.riskLevel === "Moderate") {
        setAppState("Monitoring");
      }
    } catch (err) {
      console.error(err);
      // Fallback is handled server-side normally, but if network fails:
      setBrief({
        riskLevel: "Moderate",
        concerns: ["Network error prevented AI analysis.", "Treat situation with caution."],
        recommendedActions: ["Trust your instincts.", "If in doubt, use the SOS button."],
        shouldEscalate: false,
        source: "heuristic"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch(level) {
      case "Low": return "bg-green-100 text-green-800 border-green-200";
      case "Moderate": return "bg-amber-100 text-amber-800 border-amber-200";
      case "High": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRiskIcon = (level: string) => {
    switch(level) {
      case "Low": return <CheckCircle className="text-green-600" size={24} />;
      case "Moderate": return <AlertTriangle className="text-amber-600" size={24} />;
      case "High": return <ShieldAlert className="text-red-600" size={24} />;
      default: return <Info size={24} />;
    }
  };

  return (
    <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 shadow-sm text-foreground">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bot className="text-blue-500" /> AI Safety Copilot
      </h2>
      
      <form onSubmit={handleAnalyze} className="mb-4 relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your situation (e.g., 'Walking down a dark street, someone is behind me...')"
          className="w-full border border-gray-300 dark:border-gray-700 rounded-xl p-3 pb-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 resize-none h-28"
          required
        />
        <button
          type="submit"
          disabled={loading || !text.trim()}
          className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
        >
          {loading ? "Analyzing..." : <><Send size={16} /> Assess</>}
        </button>
      </form>

      {loading && (
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      )}

      {brief && !loading && (
        <div className={`mt-4 rounded-xl border p-4 ${getRiskColor(brief.riskLevel)}`}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              {getRiskIcon(brief.riskLevel)}
              <h3 className="font-bold text-lg uppercase tracking-wide">
                {brief.riskLevel} Risk
              </h3>
            </div>
            <span className="text-xs font-medium uppercase px-2 py-1 bg-black/5 rounded-full opacity-70">
              {brief.source === "ai" ? "AI Analysis" : "Offline Analysis"}
            </span>
          </div>

          <div className="space-y-4 text-sm mt-4">
            <div>
              <strong className="block mb-1 opacity-90 font-semibold">Key Concerns:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {brief.concerns.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
            <div>
              <strong className="block mb-1 opacity-90 font-semibold">Recommended Actions:</strong>
              <ul className="list-disc pl-5 space-y-1">
                {brief.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
          </div>
          
          {brief.shouldEscalate && (
            <div className="mt-4 pt-4 border-t border-red-300/50">
              <p className="text-red-800 font-bold flex items-center gap-2 mb-2">
                <AlertTriangle size={18} /> High risk detected. Consider escalating.
              </p>
              <p className="text-xs opacity-80">Use the SOS button below to alert your trusted contacts instantly.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
