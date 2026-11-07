import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CalendarCheck, ListChecks, TrendingUp } from "lucide-react";
import MarketplaceLayout from "../components/layout/MarketplaceLayout";
import RaioXFlow from "../components/rotina/RaioXFlow";
import TodayTab from "../components/rotina/TodayTab";
import CuidadosTab from "../components/rotina/CuidadosTab";
import ProgressTab from "../components/rotina/ProgressTab";
import { cycleStatus, dateKey, dayProgress, formatDayLong, greeting, weekStreak } from "../lib/rotina/engine";
import { useRotina } from "../lib/rotina/store";

const TABS = [
  { id: "hoje", label: "Hoje", icon: ListChecks },
  { id: "cuidados", label: "Cuidados", icon: CalendarCheck },
  { id: "progresso", label: "Progresso", icon: TrendingUp },
];

export default function RotinaPage() {
  const state = useRotina();
  const [params, setParams] = useSearchParams();
  const [redo, setRedo] = useState(false);
  const tab = TABS.some((t) => t.id === params.get("aba")) ? params.get("aba") : "hoje";

  function goTab(id) {
    const next = new URLSearchParams(params);
    if (id === "hoje") next.delete("aba");
    else next.set("aba", id);
    setParams(next, { replace: true });
    window.scrollTo({ top: 0 });
  }

  if (!state.onboarded || redo) {
    return (
      <MarketplaceLayout fullWidth hideFooter>
        <div className="rotina-shell narrow">
          <RaioXFlow
            mode={redo ? "redo" : "onboarding"}
            initialScores={redo ? state.raiox?.scores : null}
            onDone={() => {
              setRedo(false);
              window.scrollTo({ top: 0 });
            }}
          />
        </div>
      </MarketplaceLayout>
    );
  }

  const today = dateKey();
  const todayPct = Math.round(dayProgress(state, today) * 100);
  const streak = weekStreak(state, today);
  const pending = state.cycles.filter((c) => ["late", "due"].includes(cycleStatus(c, today).tone)).length;

  let summary;
  if (todayPct >= 100) summary = "Rotina de hoje completa.";
  else if (todayPct > 0) summary = `${todayPct}% da rotina de hoje feita.`;
  else summary = "Sua rotina de hoje está esperando por você.";
  if (pending > 0) summary += ` ${pending} ${pending === 1 ? "cuidado pede" : "cuidados pedem"} atenção.`;

  return (
    <MarketplaceLayout fullWidth>
      <div className="rotina-shell">
        <header className="rotina-head">
          <div>
            <p className="rotina-date">{formatDayLong(today)}</p>
            <h1>{greeting()}</h1>
            <p className="rotina-summary">{summary}</p>
          </div>
          {streak > 0 ? (
            <div className="rotina-streak" aria-label={`${streak} semanas seguidas`}>
              <strong>{streak}</strong>
              <span>{streak === 1 ? "semana" : "semanas"}<br />seguidas</span>
            </div>
          ) : null}
        </header>

        <nav className="rotina-tabs" role="tablist" aria-label="Seções da rotina">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                className={tab === t.id ? "rotina-tab active" : "rotina-tab"}
                onClick={() => goTab(t.id)}
              >
                <Icon size={18} aria-hidden="true" />
                <span>{t.label}</span>
                {t.id === "cuidados" && pending > 0 ? <em className="rotina-tab-badge">{pending}</em> : null}
              </button>
            );
          })}
        </nav>

        <div className="rotina-body" role="tabpanel">
          {tab === "hoje" ? <TodayTab state={state} onOpenCuidados={() => goTab("cuidados")} /> : null}
          {tab === "cuidados" ? <CuidadosTab state={state} /> : null}
          {tab === "progresso" ? <ProgressTab state={state} onRedoRaiox={() => { setRedo(true); window.scrollTo({ top: 0 }); }} /> : null}
        </div>
      </div>
    </MarketplaceLayout>
  );
}
