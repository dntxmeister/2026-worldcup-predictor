import { useEffect, useMemo, useState } from "react";

function formatTimeRemaining(targetDate) {
  const now = new Date();

  const diff = targetDate - now;

  if (diff <= 0) {
    return "LOCKED";
  }

  const days = Math.floor(
    diff / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (diff / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (diff / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (diff / 1000) % 60
  );

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function BracketChallenge({
  bracket,
  setBracket,
  darkMode
}) {
  // LOCK TIME
  // BEFORE FIRST ROUND OF 32 MATCH
  const lockDate = useMemo(
    () =>
      new Date(
        "2026-06-29T11:00:00-05:00"
      ),
    []
  );

  const [timeRemaining, setTimeRemaining] =
    useState(
      formatTimeRemaining(lockDate)
    );

  const isLocked =
    new Date() >= lockDate;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(
        formatTimeRemaining(lockDate)
      );
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [lockDate]);

  return (
    <section
      className={`rounded-3xl p-10 shadow-2xl text-center ${
        darkMode
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-900"
      }`}
    >
      {/* HEADER */}
      <h1 className="text-5xl md:text-7xl font-extrabold mb-6">
        Bracket Challenge
      </h1>

      <p
        className={`max-w-5xl mx-auto text-xl md:text-2xl leading-relaxed ${
          darkMode
            ? "text-slate-300"
            : "text-slate-600"
        }`}
      >
        Predict the official FIFA
        knockout bracket once the Round
        of 32 is finalized.
      </p>

      {/* LOCK CARD */}
      <div
        className={`mt-12 max-w-3xl mx-auto rounded-3xl p-10 ${
          darkMode
            ? "bg-slate-800"
            : "bg-slate-100"
        }`}
      >
        <div
          className={`text-lg font-bold uppercase tracking-widest mb-3 ${
            isLocked
              ? "text-red-400"
              : "text-yellow-400"
          }`}
        >
          {isLocked
            ? "Picks Locked"
            : "Countdown Until Picks Lock"}
        </div>

        <div className="text-5xl md:text-7xl font-extrabold mb-5">
          {timeRemaining}
        </div>

        <div
          className={`text-lg ${
            darkMode
              ? "text-slate-300"
              : "text-slate-600"
          }`}
        >
          Picks officially lock before
          the first Round of 32 match on{" "}
          <span className="font-bold">
            June 29, 2026
          </span>
          .
        </div>
      </div>

      {/* STATUS */}
      <div className="mt-10">
        {!bracket ? (
          <div
            className={`rounded-3xl p-10 max-w-4xl mx-auto ${
              darkMode
                ? "bg-slate-800"
                : "bg-slate-100"
            }`}
          >
            <h2 className="text-3xl font-extrabold mb-4">
              Official Bracket Pending
            </h2>

            <p
              className={`text-lg leading-relaxed ${
                darkMode
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              The official FIFA knockout
              bracket has not yet been
              finalized. Once the group
              stage concludes and the
              Round of 32 matchups are
              officially confirmed, users
              will be able to make their
              bracket picks here.
            </p>
          </div>
        ) : (
          <div
            className={`rounded-3xl p-10 max-w-5xl mx-auto ${
              darkMode
                ? "bg-slate-800"
                : "bg-slate-100"
            }`}
          >
            <h2 className="text-4xl font-extrabold mb-5">
              Bracket Challenge Open
            </h2>

            <p
              className={`text-xl ${
                darkMode
                  ? "text-slate-300"
                  : "text-slate-600"
              }`}
            >
              The official knockout
              bracket is now available.
              Users may now submit their
              bracket predictions.
            </p>

            {/* FUTURE BRACKET UI */}
            <div className="mt-8">
              <div
                className={`rounded-2xl p-8 border-2 border-dashed ${
                  darkMode
                    ? "border-slate-600 text-slate-400"
                    : "border-slate-300 text-slate-500"
                }`}
              >
                Full bracket challenge UI
                will appear here.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SCORING */}
      <div
        className={`mt-12 max-w-5xl mx-auto rounded-3xl p-8 text-left ${
          darkMode
            ? "bg-slate-800"
            : "bg-slate-100"
        }`}
      >
        <h2 className="text-3xl font-extrabold mb-6">
          Scoring System
        </h2>

        <div className="space-y-4 text-lg">
          <div className="flex justify-between border-b border-slate-500/20 pb-3">
            <span>
              Correct team advancing
            </span>

            <span className="font-extrabold text-green-400">
              +5 pts
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-500/20 pb-3">
            <span>
              Correct matchup in future
              rounds
            </span>

            <span className="font-extrabold text-blue-400">
              +10 pts
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-500/20 pb-3">
            <span>
              Correct semifinal matchup
            </span>

            <span className="font-extrabold text-purple-400">
              +20 pts
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-500/20 pb-3">
            <span>
              Correct finalist
            </span>

            <span className="font-extrabold text-yellow-400">
              +30 pts
            </span>
          </div>

          <div className="flex justify-between">
            <span>
              Correct World Cup champion
            </span>

            <span className="font-extrabold text-red-400">
              +50 pts
            </span>
          </div>
        </div>
      </div>

      {/* RULES */}
      <div
        className={`mt-10 max-w-5xl mx-auto rounded-3xl p-8 text-left ${
          darkMode
            ? "bg-slate-800"
            : "bg-slate-100"
        }`}
      >
        <h2 className="text-3xl font-extrabold mb-5">
          Challenge Rules
        </h2>

        <ul className="space-y-4 text-lg list-disc pl-6">
          <li>
            Picks lock before the first
            Round of 32 match begins.
          </li>

          <li>
            Once picks lock, they cannot
            be edited.
          </li>

          <li>
            Group Stage Challenge and
            Bracket Challenge scores are
            combined into one leaderboard.
          </li>

          <li>
            Users compete globally for
            total tournament points.
          </li>

          <li>
            Tiebreakers are determined by
            total exact matchup accuracy
            and champion prediction.
          </li>
        </ul>
      </div>
    </section>
  );
}