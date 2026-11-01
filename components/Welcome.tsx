import { SPORTS, type Sport } from "@/lib/types";
import { motionStyle } from "./motion";

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
