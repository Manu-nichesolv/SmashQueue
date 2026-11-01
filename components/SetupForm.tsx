import type { Session } from "@/lib/types";
import { MAX_COURTS, MAX_PLAYERS, MIN_COURTS, playersPerCourt, sportLabel } from "@/lib/types";

export function SetupForm({
  session,
  onChange,
  onStart,
  onBack,
}: {
  session: Session;
  onChange: (session: Session) => void;
  onStart: () => void;
  onBack: () => void;
}) {
  const format = session.format ?? "doubles";
  const perCourt = playersPerCourt(format);
  const courtCount = session.courtLabels.length;
  const playerCount = session.players.length;
  const playing = courtCount * perCourt;
  const enough = playerCount >= playing;
  const namesReady = session.players.every((name) => name.trim().length > 0);
  const canStart = enough && namesReady;

  function setPlayerCount(count: number) {
    const players = session.players.slice(0, count);
    while (players.length < count) players.push("");
    onChange({ ...session, players });
  }

  function setCourtCount(count: number) {
    const courtLabels = session.courtLabels.slice(0, count);
    while (courtLabels.length < count) courtLabels.push(`Court ${courtLabels.length + 1}`);
    onChange({ ...session, courtLabels });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (canStart) onStart();
      }}
    >
      <header className="setup-head">
        <div>
          <p className="eyebrow">{session.sport ? sportLabel(session.sport) : "SmashQueue"}</p>
          <h1>Who&apos;s playing</h1>
        </div>
        <button type="button" className="ghost" onClick={onBack}>
          {format === "singles" ? "Singles" : "Doubles"}
        </button>
      </header>
      <p className="lede">
        {perCourt === 2 ? "Two" : "Four"} on a court. Everyone else waits. The queue keeps the games fair.
      </p>

      <section className="card">
        <div className="stepper">
          <span>Players</span>
          <div className="stepper-controls">
            <button
              type="button"
              className="icon-button"
              aria-label="Fewer players"
              disabled={playerCount <= perCourt}
              onClick={() => setPlayerCount(playerCount - 1)}
            >
              –
            </button>
            <strong>{playerCount}</strong>
            <button
              type="button"
              className="icon-button"
              aria-label="More players"
              disabled={playerCount >= MAX_PLAYERS}
              onClick={() => setPlayerCount(playerCount + 1)}
            >
              +
            </button>
          </div>
        </div>
        <div className="stepper">
          <span>Courts</span>
          <div className="stepper-controls">
            <button
              type="button"
              className="icon-button"
              aria-label="Fewer courts"
              disabled={courtCount <= MIN_COURTS}
              onClick={() => setCourtCount(courtCount - 1)}
            >
              –
            </button>
            <strong>{courtCount}</strong>
            <button
              type="button"
              className="icon-button"
              aria-label="More courts"
              disabled={courtCount >= MAX_COURTS}
              onClick={() => setCourtCount(courtCount + 1)}
            >
              +
            </button>
          </div>
        </div>
        <p className={enough ? "status" : "status warn"} aria-live="polite">
          {enough
            ? playerCount === playing
              ? `${playing} playing · nobody sitting`
              : `${playing} playing · ${playerCount - playing} sitting`
            : `${courtCount} ${courtCount === 1 ? "court needs" : "courts need"} ${playing} players`}
        </p>
      </section>

      <section className="card">
        {session.courtLabels.map((label, index) => (
          <label className="field" key={index}>
            <span>Court {index + 1}</span>
            <input
              value={label}
              aria-label={`Court ${index + 1} number`}
              onChange={(event) => {
                const courtLabels = [...session.courtLabels];
                courtLabels[index] = event.target.value;
                onChange({ ...session, courtLabels });
              }}
            />
          </label>
        ))}
      </section>

      <section className="card">
        {session.players.map((name, index) => (
          <label className="field" key={index}>
            <span>Player {index + 1}</span>
            <input
              value={name}
              placeholder={`Player ${index + 1}`}
              aria-label={`Player ${index + 1} name`}
              onChange={(event) => {
                const players = [...session.players];
                players[index] = event.target.value;
                onChange({ ...session, players });
              }}
            />
          </label>
        ))}
      </section>

      <button className="button primary" type="submit" disabled={!canStart}>
        Start
      </button>
    </form>
  );
}
