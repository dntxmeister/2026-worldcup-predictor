import { useEffect, useState } from "react";

import {
  OFFICIAL_BRACKET_UNLOCKED,
  BRACKET_PICKS_LOCK_AT
} from "../config/tournamentStatus";

export default function BracketChallengeLocked({
  darkMode,
  onGoToTournamentChallenge
}) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  function getTimeLeft() {
    const lockTime = new Date(BRACKET_PICKS_LOCK_AT).getTime();
    const now = Date.now();
    const difference = lockTime - now;

    if (difference <= 0) {
      return {
        expired: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
      };
    }

    return {
      expired: false,
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const lockDate = new Date(BRACKET_PICKS_LOCK_AT);

  return (
    <section
      className={`rounded-3xl shadow-2xl p-10 text-center ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-900"
      }`}
    >
      <h2 className="text-4xl font-extrabold mb-4">
        Bracket Challenge Locked
      </h2>

      <p className={darkMode ? "text-slate-300" : "text-gray-600"}>
        This section unlocks once the official FIFA knockout bracket is known.
        After it unlocks, users can make official bracket picks.
      </p>

      <div
        className={`mt-8 rounded-3xl p-6 inline-block ${
          darkMode ? "bg-slate-800" : "bg-slate-100"
        }`}
      >
        <div className="font-bold text-xl mb-4">
          Picks lock before:
        </div>

        <div className="text-3xl font-extrabold mb-5">
          {lockDate.toLocaleString()}
        </div>

        <div className="grid grid-cols-4 gap-3">
          <CountdownBox label="Days" value={timeLeft.days} darkMode={darkMode} />
          <CountdownBox label="Hours" value={timeLeft.hours} darkMode={darkMode} />
          <CountdownBox label="Minutes" value={timeLeft.minutes} darkMode={darkMode} />
          <CountdownBox label="Seconds" value={timeLeft.seconds} darkMode={darkMode} />
        </div>

        {timeLeft.expired && (
          <div className="mt-5 rounded-full bg-red-500 px-5 py-2 font-bold text-white">
            Picks are locked
          </div>
        )}
      </div>

      <p className="mt-6 text-sm opacity-80">
        Once bracket picks lock, they cannot be changed.
      </p>

      <button
        onClick={onGoToTournamentChallenge}
        className="mt-6 rounded-full bg-yellow-400 text-slate-900 px-6 py-3 font-bold hover:bg-yellow-300"
      >
        Go to Tournament Challenge
      </button>
    </section>
  );
}

function CountdownBox({ label, value, darkMode }) {
  return (
    <div
      className={`rounded-2xl px-4 py-3 ${
        darkMode ? "bg-slate-900" : "bg-white"
      }`}
    >
      <div className="text-3xl font-black">
        {String(value).padStart(2, "0")}
      </div>

      <div className="text-xs font-bold uppercase opacity-70">
        {label}
      </div>
    </div>
  );
}

export function isBracketPickLocked() {
  return Date.now() >= new Date(BRACKET_PICKS_LOCK_AT).getTime();
}

export function isBracketChallengeUnlocked() {
  return OFFICIAL_BRACKET_UNLOCKED;
}