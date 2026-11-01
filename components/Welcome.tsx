import { SPORTS, type Format, type Sport } from "@/lib/types";
import { motionStyle } from "./motion";

export function CoverArt() {
  return (
    <div className="cover-art" aria-hidden="true">
      <Racket />
      <Paddle />
      <Shuttle />
    </div>
  );
}

export function HomeScreen({ onPlay }: { onPlay: () => void }) {
  return (
    <div className="home">
      <h1 className="home-title animate__animated animate__fadeIn">SmashQueue</h1>
      <button
        type="button"
        className="button primary home-play animate__animated animate__fadeInUp"
        style={motionStyle(0.12)}
        onClick={onPlay}
      >
        Play
      </button>
    </div>
  );
}

export function FormatPicker({ onChoose, onBack }: { onChoose: (format: Format) => void; onBack: () => void }) {
  const choices: Array<{ id: Format; label: string }> = [
    { id: "singles", label: "Singles" },
    { id: "doubles", label: "Doubles" },
  ];

  return (
    <div className="sport">
      <p className="eyebrow">Choose a game</p>
      <h1>Are you playing singles or doubles?</h1>
      <div className="sport-list">
        {choices.map((choice, index) => (
          <button
            key={choice.id}
            type="button"
            className="sport-option animate__animated animate__fadeInUp"
            style={motionStyle(index * 0.06)}
            onClick={() => onChoose(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
      <button type="button" className="ghost sport-back" onClick={onBack}>
        Back
      </button>
    </div>
  );
}

export function SportPicker({ onChoose, onBack }: { onChoose: (sport: Sport) => void; onBack: () => void }) {
  return (
    <div className="sport">
      <p className="eyebrow">Choose a sport</p>
      <h1>What are you playing?</h1>
      <div className="sport-list">
        {SPORTS.map((sport, index) => (
          <button
            key={sport.id}
            type="button"
            className="sport-option animate__animated animate__fadeInUp"
            style={motionStyle(index * 0.06)}
            onClick={() => onChoose(sport.id)}
          >
            {sport.label}
          </button>
        ))}
      </div>
      <button type="button" className="ghost sport-back" onClick={onBack}>
        Back
      </button>
    </div>
  );
}

function Racket() {
  return (
    <svg className="cover-racket" viewBox="0 0 200 440" fill="none">
      <ellipse cx="100" cy="112" rx="68" ry="90" stroke="currentColor" strokeWidth="7" />
      <g clipPath="url(#racket-face)" stroke="currentColor" strokeWidth="1.6">
        <path d="M40 70h120M40 98h120M40 126h120M40 154h120" />
        <path d="M72 24v176M100 22v180M128 24v176" />
      </g>
      <path d="M74 198c10 16 42 16 52 0" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      <path d="M100 210v128" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <rect x="84" y="334" width="32" height="78" rx="10" stroke="currentColor" strokeWidth="7" />
      <defs>
        <clipPath id="racket-face">
          <ellipse cx="100" cy="112" rx="60" ry="82" />
        </clipPath>
      </defs>
    </svg>
  );
}

function Shuttle() {
  return (
    <svg className="cover-shuttle" viewBox="0 0 140 190" fill="none">
      <path d="M70 18c-42 28-52 78-36 112" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 18c42 28 52 78 36 112" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M70 12v116" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M50 34c-8 28-6 62 6 94" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M90 34c8 28 6 62-6 94" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M34 130c12 14 28 20 36 20s24-6 36-20" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="70" cy="158" rx="20" ry="22" stroke="currentColor" strokeWidth="6" />
    </svg>
  );
}

function Paddle() {
  return (
    <svg className="cover-paddle" viewBox="0 0 180 340" fill="none">
      <rect x="28" y="18" width="124" height="168" rx="62" stroke="currentColor" strokeWidth="7" />
      <g fill="currentColor">
        <circle cx="66" cy="78" r="3.2" />
        <circle cx="90" cy="78" r="3.2" />
        <circle cx="114" cy="78" r="3.2" />
        <circle cx="78" cy="102" r="3.2" />
        <circle cx="102" cy="102" r="3.2" />
        <circle cx="66" cy="126" r="3.2" />
        <circle cx="90" cy="126" r="3.2" />
        <circle cx="114" cy="126" r="3.2" />
      </g>
      <path d="M90 186v78" stroke="currentColor" strokeWidth="9" strokeLinecap="round" />
      <rect x="73" y="258" width="34" height="58" rx="10" stroke="currentColor" strokeWidth="7" />
    </svg>
  );
}
