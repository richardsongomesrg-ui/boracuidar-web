import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Lightbulb, Minus, Plus, Settings2, Trash2, X } from "lucide-react";
import { HABIT_CATALOG, dimensionById } from "../../lib/rotina/catalog";
import {
  dateKey,
  dayProgress,
  formatDayLong,
  habitDone,
  habitValue,
  habitWeekProgress,
  parseKey,
  sortCyclesByAttention,
  cycleStatus,
  tipOfDay,
  weekDays,
} from "../../lib/rotina/engine";
import { addCustomHabit, addHabit, markCycleDone, removeHabit, setHabitValue } from "../../lib/rotina/store";
import { DimensionIcon, HabitIcon } from "./RotinaIcon";
import { marketplaceLinkForCycle } from "./links";

const WEEKDAY_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];

function HabitRow({ state, habit, dayKey }) {
  const value = habitValue(state, habit.id, dayKey);
  const done = habitDone(habit, value);
  const week = habitWeekProgress(state, habit, dayKey);

  let meta;
  if (habit.period === "week") meta = `${week.done} de ${habit.target} nesta semana`;
  else if (habit.kind === "count") meta = `${value} de ${habit.target} ${habit.unit}`;
  else meta = dimensionById(habit.dim)?.label ?? "";

  return (
    <li className={done ? "habit-row done" : "habit-row"}>
      <span className="habit-icon"><HabitIcon name={habit.icon} /></span>
      <div className="habit-text">
        <strong>{habit.label}</strong>
        <small>{meta}</small>
        {habit.kind === "count" ? (
          <span className="habit-meter" aria-hidden="true">
            <i style={{ width: `${Math.min(1, value / habit.target) * 100}%` }} />
          </span>
        ) : null}
      </div>
      {habit.kind === "count" ? (
        <div className="habit-stepper">
          <button type="button" aria-label={`Menos 1 em ${habit.label}`} onClick={() => setHabitValue(habit.id, dayKey, Math.max(0, value - 1))} disabled={value === 0}>
            <Minus size={16} />
          </button>
          <span className="habit-stepper-value">{value}</span>
          <button type="button" aria-label={`Mais 1 em ${habit.label}`} onClick={() => setHabitValue(habit.id, dayKey, value + 1)}>
            <Plus size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={value >= 1 ? "habit-check on" : "habit-check"}
          aria-pressed={value >= 1}
          aria-label={value >= 1 ? `Desmarcar ${habit.label}` : `Marcar ${habit.label} como feito`}
          onClick={() => setHabitValue(habit.id, dayKey, value >= 1 ? 0 : 1)}
        >
          <Check size={18} />
        </button>
      )}
    </li>
  );
}

function HabitEditor({ state, onClose }) {
  const [custom, setCustom] = useState("");
  const available = HABIT_CATALOG.filter((h) => !state.habits.some((x) => x.id === h.id));
  return (
    <div className="rotina-panel habit-editor">
      <div className="rotina-panel-head">
        <h3>Editar hábitos</h3>
        <button type="button" className="business-schedules-close" onClick={onClose} aria-label="Fechar edição">
          <X size={16} />
        </button>
      </div>
      <ul className="habit-editor-list">
        {state.habits.map((habit) => (
          <li key={habit.id}>
            <HabitIcon name={habit.icon} size={16} />
            <span>{habit.label}</span>
            <button type="button" className="icon-text-btn" onClick={() => removeHabit(habit.id)} aria-label={`Remover ${habit.label}`}>
              <Trash2 size={15} />
            </button>
          </li>
        ))}
      </ul>
      {available.length > 0 ? (
        <>
          <p className="rotina-panel-label">Adicionar</p>
          <div className="raiox-chip-row">
            {available.map((habit) => (
              <button key={habit.id} type="button" className="raiox-chip" onClick={() => addHabit(habit.id)}>
                <Plus size={13} /> {habit.label}
              </button>
            ))}
          </div>
        </>
      ) : null}
      <form
        className="habit-custom-form"
        onSubmit={(event) => {
          event.preventDefault();
          addCustomHabit(custom);
          setCustom("");
        }}
      >
        <label htmlFor="habit-custom-input" className="rotina-panel-label">Criar um hábito seu</label>
        <div className="search-row">
          <input id="habit-custom-input" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Ex.: tomar sol pela manhã" maxLength={60} />
          <button type="submit" className="ghost-btn" disabled={!custom.trim()}>Adicionar</button>
        </div>
      </form>
    </div>
  );
}

export default function TodayTab({ state, onOpenCuidados }) {
  const today = dateKey();
  const [dayKey, setDayKey] = useState(today);
  const [editing, setEditing] = useState(false);
  const days = weekDays(today);
  const attention = sortCyclesByAttention(state.cycles, today)
    .filter((c) => !["ok", "scheduled"].includes(cycleStatus(c, today).tone))
    .slice(0, 3);
  const tip = tipOfDay(state.raiox?.priorities ?? [], today);
  const tipDim = dimensionById(tip.dim);

  return (
    <div className="rotina-today">
      <div className="rotina-today-main">
        <div className="rotina-week-strip" role="tablist" aria-label="Dias da semana">
          {days.map((key) => {
            const progress = dayProgress(state, key);
            const future = key > today;
            const selected = key === dayKey;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={selected}
                disabled={future}
                className={["week-day", selected ? "selected" : "", key === today ? "today" : ""].join(" ").trim()}
                onClick={() => setDayKey(key)}
              >
                <span className="week-day-letter">{WEEKDAY_SHORT[parseKey(key).getDay()]}</span>
                <span className="week-day-ring" style={{ "--p": future ? 0 : progress }}>
                  <span>{parseKey(key).getDate()}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="rotina-section-head">
          <h2>{dayKey === today ? "Hoje" : formatDayLong(dayKey)}</h2>
          <button type="button" className="icon-text-btn" onClick={() => setEditing((v) => !v)} aria-expanded={editing}>
            <Settings2 size={15} /> Editar
          </button>
        </div>

        {editing ? <HabitEditor state={state} onClose={() => setEditing(false)} /> : null}

        {state.habits.length === 0 ? (
          <p className="muted">Você ainda não tem hábitos. Toque em Editar pra escolher alguns.</p>
        ) : (
          <ul className="habit-list">
            {state.habits.map((habit) => (
              <HabitRow key={habit.id} state={state} habit={habit} dayKey={dayKey} />
            ))}
          </ul>
        )}
      </div>

      <aside className="rotina-today-side">
        <section className="rotina-panel">
          <div className="rotina-panel-head">
            <h3>Pra ficar de olho</h3>
            <button type="button" className="icon-text-btn" onClick={onOpenCuidados}>Ver todos</button>
          </div>
          {attention.length === 0 ? (
            <p className="muted">Tudo em dia por aqui. A gente avisa quando chegar a hora do próximo cuidado.</p>
          ) : (
            <ul className="attention-list">
              {attention.map((cycle) => {
                const status = cycleStatus(cycle, today);
                return (
                  <li key={cycle.id} className="attention-item">
                    <span className="habit-icon"><DimensionIcon id={cycle.dim} /></span>
                    <div>
                      <strong>{cycle.label}</strong>
                      <small className={`status-text ${status.tone}`}>{status.label}</small>
                    </div>
                    <div className="attention-actions">
                      <Link className="cta-btn small" to={marketplaceLinkForCycle(cycle)}>Agendar</Link>
                      <button type="button" className="icon-text-btn" onClick={() => markCycleDone(cycle.id, today)}>Já fiz</button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="rotina-panel rotina-tip">
          <p className="rotina-tip-label"><Lightbulb size={15} /> Dica do dia · {tipDim?.label}</p>
          <p className="rotina-tip-text">{tip.text}</p>
          <p className="rotina-tip-note">Dica geral. Não substitui a orientação de um profissional.</p>
        </section>
      </aside>
    </div>
  );
}
