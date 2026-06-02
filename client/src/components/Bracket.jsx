import { useState } from "react";
import "flag-icons/css/flag-icons.min.css";
import { advanceWinner } from "../logic/worldCupLogic";

const CARD_W = 150;
const CARD_H = 92;
const CARD_H_PENS = 124;
const META_H = 26;

const fifaRankPower = {
  ESP: 1, ARG: 2, FRA: 3, ENG: 4, BRA: 5, POR: 6, NED: 7, BEL: 8, GER: 9,
  CRO: 10, MAR: 11, COL: 13, USA: 14, MEX: 15, URU: 16, SUI: 20, JPN: 21,
  SEN: 22, IRN: 24, KOR: 25, AUS: 26, SWE: 27, ECU: 28, AUT: 29, TUR: 30,
  NOR: 32, QAT: 48, CIV: 50, SCO: 51, ALG: 52, EGY: 53, KSA: 56, CHI: 58,
  RSA: 60, PAR: 62, UZB: 64, BIH: 66, PAN: 67, GHA: 70, CZE: 72, JOR: 75,
  HAI: 82, NZL: 88, CPV: 94, IRQ: 96, TUN: 99, COD: 105, CUW: 110
};

const positions = {
  left: {
    roundOf32: { x: 0, y: [90, 245, 400, 555, 710, 865, 1020, 1175] },
    roundOf16: { x: 230, y: [155, 405, 655, 905] },
    quarterFinals: { x: 450, y: [280, 780] },
    semiFinals: { x: 650, y: [530] }
  },
  center: {
    final: { x: 830, y: 490 },
    thirdPlace: { x: 830, y: 680 },
    champion: { x: 735, y: 130 }
  },
  right: {
    semiFinals: { x: 1010, y: [530] },
    quarterFinals: { x: 1210, y: [280, 780] },
    roundOf16: { x: 1430, y: [155, 405, 655, 905] },
    roundOf32: { x: 1660, y: [90, 245, 400, 555, 710, 865, 1020, 1175] }
  }
};

function placeholderTeam(label) {
  return {
    name: label,
    fifaCode: label,
    flagCode: null,
    isPlaceholder: true
  };
}

function isRealTeam(team) {
  return (
    team &&
    !team.isPlaceholder &&
    team.fifaCode &&
    !team.fifaCode.includes("Winner") &&
    !team.fifaCode.includes("Loser")
  );
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function matchHasScore(match) {
  return (
    match &&
    match.scoreA !== "" &&
    match.scoreA !== undefined &&
    match.scoreB !== "" &&
    match.scoreB !== undefined
  );
}

function pickWeightedWinner(teamA, teamB) {
  if (!isRealTeam(teamA)) return teamB;
  if (!isRealTeam(teamB)) return teamA;

  const rankA = fifaRankPower[teamA.fifaCode] || 120;
  const rankB = fifaRankPower[teamB.fifaCode] || 120;

  const ratingA = 1 / Math.pow(rankA, 0.72) + Math.random() * 0.45;
  const ratingB = 1 / Math.pow(rankB, 0.72) + Math.random() * 0.45;

  return ratingA >= ratingB ? teamA : teamB;
}

function getPenaltyResult(winner) {
  const penaltyScores = [
    "5-4",
    "4-3",
    "4-2",
    "4-1",
    "3-1",
    "2-0",
    "2-1",
    "3-2",
    "6-5"
  ];

  return `${winner.fifaCode} advances ${randomItem(penaltyScores)} on pens`;
}

function getBracketResult(winner, loser) {
  const penaltyChance = 0.23;

  if (Math.random() < penaltyChance) {
    const drawScore = randomItem([
      [0, 0],
      [1, 1],
      [2, 2],
      [3, 3]
    ]);

    return {
      winnerScore: drawScore[0],
      loserScore: drawScore[1],
      penaltyText: getPenaltyResult(winner)
    };
  }

  const winnerRank = fifaRankPower[winner?.fifaCode] || 120;
  const loserRank = fifaRankPower[loser?.fifaCode] || 120;

  const isUpset = winnerRank > loserRank;
  const mismatch = Math.abs(winnerRank - loserRank);

  let score;

  if (isUpset && mismatch >= 20) {
    score = randomItem([
      [1, 0],
      [2, 1],
      [3, 2]
    ]);
  } else if (!isUpset && mismatch >= 45) {
    score = randomItem([
      [3, 0],
      [4, 0],
      [4, 1],
      [5, 0],
      [5, 1]
    ]);
  } else if (!isUpset && mismatch >= 20) {
    score = randomItem([
      [2, 0],
      [2, 1],
      [3, 1],
      [3, 2]
    ]);
  } else {
    score = randomItem([
      [1, 0],
      [2, 1],
      [3, 2],
      [2, 0]
    ]);
  }

  return {
    winnerScore: score[0],
    loserScore: score[1],
    penaltyText: ""
  };
}

function resetMatch(match, teamA, teamB) {
  return {
    ...match,
    teamA,
    teamB,
    winner: null,
    loser: null,
    scoreA: "",
    scoreB: "",
    penaltyText: "",
    simulated: false
  };
}

function resetGeneratedRounds(bracket) {
  const next = structuredClone(bracket);

  function preserveMatch(match) {
    return match && match.winner && matchHasScore(match);
  }

  next.roundOf32 = next.roundOf32.map(match => {
    if (preserveMatch(match)) {
      return match;
    }

    return {
      ...match,
      winner: null,
      loser: null,
      scoreA: "",
      scoreB: "",
      penaltyText: "",
      simulated: false
    };
  });

  next.roundOf16 = next.roundOf16.map((match, index) => {
    if (preserveMatch(match)) {
      return match;
    }

    return resetMatch(
      match,
      next.roundOf32[index * 2]?.winner ||
        placeholderTeam(`Winner ${next.roundOf32[index * 2]?.id}`),

      next.roundOf32[index * 2 + 1]?.winner ||
        placeholderTeam(`Winner ${next.roundOf32[index * 2 + 1]?.id}`)
    );
  });

  next.quarterFinals = next.quarterFinals.map((match, index) => {
    if (preserveMatch(match)) {
      return match;
    }

    return resetMatch(
      match,
      next.roundOf16[index * 2]?.winner ||
        placeholderTeam(`Winner ${next.roundOf16[index * 2]?.id}`),

      next.roundOf16[index * 2 + 1]?.winner ||
        placeholderTeam(`Winner ${next.roundOf16[index * 2 + 1]?.id}`)
    );
  });

  next.semiFinals = next.semiFinals.map((match, index) => {
    if (preserveMatch(match)) {
      return match;
    }

    return resetMatch(
      match,
      next.quarterFinals[index * 2]?.winner ||
        placeholderTeam(`Winner ${next.quarterFinals[index * 2]?.id}`),

      next.quarterFinals[index * 2 + 1]?.winner ||
        placeholderTeam(`Winner ${next.quarterFinals[index * 2 + 1]?.id}`)
    );
  });

  if (!preserveMatch(next.final[0])) {
    next.final = [
      resetMatch(
        next.final[0],
        next.semiFinals[0]?.winner ||
          placeholderTeam(`Winner ${next.semiFinals[0]?.id}`),

        next.semiFinals[1]?.winner ||
          placeholderTeam(`Winner ${next.semiFinals[1]?.id}`)
      )
    ];
  }

  if (!preserveMatch(next.thirdPlace[0])) {
    next.thirdPlace = [
      resetMatch(
        next.thirdPlace[0],
        next.semiFinals[0]?.loser ||
          placeholderTeam(`Loser ${next.semiFinals[0]?.id}`),

        next.semiFinals[1]?.loser ||
          placeholderTeam(`Loser ${next.semiFinals[1]?.id}`)
      )
    ];
  }

  next.champion = next.final[0]?.winner || null;
  next.thirdPlaceWinner = next.thirdPlace[0]?.winner || null;

  return next;
}

function autofillSingleMatch(bracket, roundName, matchIndex) {
  const match = bracket[roundName]?.[matchIndex];

  if (!match?.teamA || !match?.teamB) {
    return bracket;
  }

  if (match.userLocked && matchHasScore(match) && match.winner) {
    return advanceWinner(bracket, roundName, matchIndex, match.winner);
  }

  const winner = pickWeightedWinner(match.teamA, match.teamB);
  const loser =
    winner?.fifaCode === match.teamA?.fifaCode ? match.teamB : match.teamA;

  if (!isRealTeam(winner) || !isRealTeam(loser)) {
    return bracket;
  }

  const result = getBracketResult(winner, loser);

  const next = structuredClone(bracket);
  const nextMatch = next[roundName][matchIndex];

  if (winner.fifaCode === nextMatch.teamA.fifaCode) {
    nextMatch.scoreA = result.winnerScore;
    nextMatch.scoreB = result.loserScore;
  } else {
    nextMatch.scoreA = result.loserScore;
    nextMatch.scoreB = result.winnerScore;
  }

  nextMatch.penaltyText = result.penaltyText;
  nextMatch.simulated = true;
  nextMatch.userLocked = false;

  return advanceWinner(next, roundName, matchIndex, winner);
}

function autofillBracketToRound(bracket, targetRound) {
  let next = resetGeneratedRounds(bracket);

  const targetMap = {
    roundOf32: ["roundOf32"],
    roundOf16: ["roundOf32", "roundOf16"],
    quarterFinals: ["roundOf32", "roundOf16", "quarterFinals"],
    semiFinals: ["roundOf32", "roundOf16", "quarterFinals", "semiFinals"],
    final: [
      "roundOf32",
      "roundOf16",
      "quarterFinals",
      "semiFinals",
      "thirdPlace",
      "final"
    ],
    entire: [
      "roundOf32",
      "roundOf16",
      "quarterFinals",
      "semiFinals",
      "thirdPlace",
      "final"
    ]
  };

  const roundsToRun = targetMap[targetRound] || targetMap.entire;

  roundsToRun.forEach(roundName => {
    const matches = next[roundName];

    if (!Array.isArray(matches)) return;

    matches.forEach((_, matchIndex) => {
      next = autofillSingleMatch(next, roundName, matchIndex);
    });
  });

  return next;
}

export default function Bracket({ bracket, setBracket, darkMode }) {
    const [autofillTarget, setAutofillTarget] = useState("roundOf32");
    const [originalBracket] = useState(() => structuredClone(bracket));
  
    function handleAutofillBracket() {
      setBracket(prev => {
        if (!prev) return prev;
        return autofillBracketToRound(prev, autofillTarget);
      });
    }
  
    function handleResetBracket() {
      if (!window.confirm("Reset all bracket selections and scores?")) {
        return;
      }
  
      setBracket(structuredClone(originalBracket));
    }
  
    function pickWinner(roundName, matchIndex, team) {
      if (!team || team.isPlaceholder) return;
  
      setBracket(prev => {
        const updated = structuredClone(prev);
        const match = updated[roundName][matchIndex];
  
        if (!match?.teamA || !match?.teamB) return prev;
  
        const winner = team;
        const loser =
          winner.fifaCode === match.teamA.fifaCode ? match.teamB : match.teamA;
  
        if (!isRealTeam(winner) || !isRealTeam(loser)) return prev;
  
        const result = getBracketResult(winner, loser);
  
        if (winner.fifaCode === match.teamA.fifaCode) {
          match.scoreA = result.winnerScore;
          match.scoreB = result.loserScore;
        } else {
          match.scoreA = result.loserScore;
          match.scoreB = result.winnerScore;
        }
  
        match.penaltyText = result.penaltyText;
        match.userLocked = true;
        match.simulated = false;
  
        return advanceWinner(updated, roundName, matchIndex, winner);
      });
    }
  
    function updateScore(roundName, matchIndex, teamIndex, value) {
      setBracket(prev => {
        const updated = structuredClone(prev);
        const match = updated[roundName][matchIndex];
  
        if (!match) return prev;
  
        const cleanValue = value === "" ? "" : Number(value);
  
        if (teamIndex === 0) {
          match.scoreA = cleanValue;
        } else {
          match.scoreB = cleanValue;
        }
  
        match.penaltyText = "";
        match.userLocked = true;
        match.simulated = false;
  
        const hasA = match.scoreA !== "" && match.scoreA !== undefined;
        const hasB = match.scoreB !== "" && match.scoreB !== undefined;
  
        if (hasA && hasB && Number(match.scoreA) !== Number(match.scoreB)) {
          const winner =
            Number(match.scoreA) > Number(match.scoreB) ? match.teamA : match.teamB;
  
          if (winner && !winner.isPlaceholder) {
            return advanceWinner(updated, roundName, matchIndex, winner);
          }
        }
  
        return updated;
      });
    }
  
    return (
      <section
        className={`rounded-3xl shadow-2xl p-3 sm:p-6 transition ${
          darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-2">
              2026 World Cup Bracket
            </h2>
  
            <p className={darkMode ? "text-slate-300" : "text-gray-600"}>
              Click a team, manually input scores, or select "Simulate Bracket" and choose the desired tournament round to simulate
            </p>
          </div>
  
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 w-full lg:w-auto">
            <select
              value={autofillTarget}
              onChange={e => setAutofillTarget(e.target.value)}
              className={`w-full sm:w-auto rounded-full px-4 py-3 font-bold outline-none ${
                darkMode
                  ? "bg-slate-800 text-white border border-slate-600"
                  : "bg-white text-slate-900 border border-slate-300"
              }`}
            >
              <option value="roundOf32">Round of 32 only</option>
              <option value="roundOf16">Through Round of 16</option>
              <option value="quarterFinals">Through Quarterfinals</option>
              <option value="semiFinals">Through Semifinals</option>
              <option value="final">Entire Tournament</option>
            </select>
  
            <button
              onClick={handleResetBracket}
              className="w-full sm:w-auto rounded-full bg-red-600 text-white px-6 py-3 font-bold hover:bg-red-700 transition"
            >
              Reset Bracket
            </button>
  
            <button
              onClick={handleAutofillBracket}
              className="w-full sm:w-auto rounded-full bg-purple-600 text-white px-6 py-3 font-bold hover:bg-purple-700 transition"
            >
              Simulate Bracket
            </button>
          </div>
        </div>
  
        <div className="-mx-3 sm:mx-0 overflow-x-auto pb-4">
          <div
            id="bracket-root"
            className={`relative mx-auto w-[1810px] h-[1330px] ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            <Headers darkMode={darkMode} />
            <BracketLines />
  
            <Side
              side="left"
              bracket={bracket}
              onPick={pickWinner}
              onScoreChange={updateScore}
              darkMode={darkMode}
            />
  
            <Center
              bracket={bracket}
              onPick={pickWinner}
              onScoreChange={updateScore}
              darkMode={darkMode}
            />
  
            <Side
              side="right"
              bracket={bracket}
              onPick={pickWinner}
              onScoreChange={updateScore}
              darkMode={darkMode}
            />
          </div>
        </div>
      </section>
    );
  }

function Headers({ darkMode }) {
  const headers = [
    ["Round of 32", "Jun 29 – Jul 3", positions.left.roundOf32.x],
    ["Round of 16", "Jul 4 – Jul 7", positions.left.roundOf16.x],
    ["Quarterfinals", "Jul 9 – Jul 11", positions.left.quarterFinals.x],
    ["Semifinals", "Jul 14 – Jul 15", positions.left.semiFinals.x],
    ["Semifinals", "Jul 14 – Jul 15", positions.right.semiFinals.x],
    ["Quarterfinals", "Jul 9 – Jul 11", positions.right.quarterFinals.x],
    ["Round of 16", "Jul 4 – Jul 7", positions.right.roundOf16.x],
    ["Round of 32", "Jun 29 – Jul 3", positions.right.roundOf32.x]
  ];

  return (
    <>
      {headers.map(([title, date, x]) => (
        <div
          key={`${title}-${x}`}
          className="absolute top-0 text-center"
          style={{ left: x, width: CARD_W }}
        >
          <h3
            className={`font-extrabold text-base ${
              darkMode ? "text-white" : "text-slate-900"
            }`}
          >
            {title}
          </h3>

          <p
            className={`text-[11px] ${
              darkMode ? "text-slate-300" : "text-gray-500"
            }`}
          >
            {date}
          </p>
        </div>
      ))}
    </>
  );
}

function Side({ side, bracket, onPick, onScoreChange, darkMode }) {
  const isLeft = side === "left";

  const rounds = isLeft
    ? [
        ["roundOf32", 0, 8],
        ["roundOf16", 0, 4],
        ["quarterFinals", 0, 2],
        ["semiFinals", 0, 1]
      ]
    : [
        ["semiFinals", 1, 1],
        ["quarterFinals", 2, 2],
        ["roundOf16", 4, 4],
        ["roundOf32", 8, 8]
      ];

  return (
    <>
      {rounds.map(([roundName, start, count]) =>
        bracket[roundName]
          .slice(start, start + count)
          .map((match, localIndex) => {
            const x = positions[side][roundName].x;
            const y = positions[side][roundName].y[localIndex];
            const globalIndex = start + localIndex;

            return (
              <MatchBlock
                key={match.id}
                x={x}
                y={y}
                match={match}
                index={globalIndex}
                roundName={roundName}
                onPick={onPick}
                onScoreChange={onScoreChange}
                darkMode={darkMode}
              />
            );
          })
      )}
    </>
  );
}

function Center({ bracket, onPick, onScoreChange, darkMode }) {
  return (
    <>
      <div
        className="absolute text-center"
        style={{
          left: positions.center.final.x,
          top: positions.center.final.y,
          width: CARD_W
        }}
      >
        <h3
          className={`font-extrabold text-lg ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Final
        </h3>

        <p
          className={`text-[11px] font-semibold mb-2 leading-tight ${
            darkMode ? "text-blue-300" : "text-blue-900"
          }`}
        >
          Jul 19 · New York
        </p>

        <MatchCard
          match={bracket.final[0]}
          index={0}
          roundName="final"
          onPick={onPick}
          onScoreChange={onScoreChange}
          darkMode={darkMode}
        />
      </div>

      <div
        className="absolute text-center"
        style={{
          left: positions.center.thirdPlace.x,
          top: positions.center.thirdPlace.y,
          width: CARD_W
        }}
      >
        <h3
          className={`font-extrabold text-base ${
            darkMode ? "text-white" : "text-slate-900"
          }`}
        >
          Third Place Match
        </h3>

        <p
          className={`text-[11px] font-semibold mb-2 leading-tight ${
            darkMode ? "text-blue-300" : "text-blue-900"
          }`}
        >
          Jul 18 · Miami
        </p>

        <MatchCard
          match={bracket.thirdPlace[0]}
          index={0}
          roundName="thirdPlace"
          onPick={onPick}
          onScoreChange={onScoreChange}
          darkMode={darkMode}
        />
      </div>

      <div
        className={`absolute text-center border rounded-2xl p-6 ${
          darkMode
            ? "bg-yellow-900/40 border-yellow-500 text-white"
            : "bg-yellow-100 border-yellow-300 text-slate-900"
        }`}
        style={{
          left: positions.center.champion.x,
          top: positions.center.champion.y,
          width: 360
        }}
      >
        <div className="text-2xl font-bold">Champion 🏆</div>

        <div className="mt-4 flex items-center justify-center gap-4 text-5xl font-extrabold">
          {bracket.champion ? (
            <>
              <span className="flex h-9 w-12 items-center justify-center shrink-0">
                <FlagImage
                    flagCode={bracket.champion.flagCode}
                    className="w-12 h-9 block"
                />
                </span>

                <span className="text-4xl leading-none">
                {bracket.champion.name}
                </span>
            </>
          ) : (
            <span>TBD</span>
          )}
        </div>
      </div>
    </>
  );
}

function MatchBlock({
  x,
  y,
  match,
  index,
  roundName,
  onPick,
  onScoreChange,
  darkMode
}) {
  return (
    <div className="absolute" style={{ left: x, top: y, width: CARD_W }}>
      <div
        className={`text-center text-[11px] font-semibold mb-2 leading-tight ${
          darkMode ? "text-blue-300" : "text-blue-900"
        }`}
      >
        {match?.date || "TBD"} · {match?.city || "TBD"}
      </div>

      <MatchCard
        match={match}
        index={index}
        roundName={roundName}
        onPick={onPick}
        onScoreChange={onScoreChange}
        darkMode={darkMode}
      />
    </div>
  );
}

function MatchCard({
  match,
  index,
  roundName,
  onPick,
  onScoreChange,
  darkMode
}) {
  const matchIsAssigned =
    match?.teamA &&
    match?.teamB &&
    !match.teamA.isPlaceholder &&
    !match.teamB.isPlaceholder;

  const hasPens = Boolean(match?.penaltyText);
  const cardHeight = hasPens ? CARD_H_PENS : CARD_H;
  const teamRowHeight = hasPens ? "h-[38%]" : "h-1/2";

  return (
    <div
      className={`border rounded-xl overflow-hidden shadow-sm transition ${
        darkMode
          ? "bg-slate-800 border-slate-600 text-white"
          : "bg-white border-gray-200 text-black"
      }`}
      style={{ width: CARD_W, height: cardHeight }}
    >
      {[match?.teamA, match?.teamB].map((team, teamIndex) => {
        const scoreValue =
          teamIndex === 0 ? match?.scoreA ?? "" : match?.scoreB ?? "";

        return (
          <div
            key={teamIndex}
            className={`w-full ${teamRowHeight} flex items-center justify-between px-3 transition ${
              match?.winner?.fifaCode === team?.fifaCode
                ? darkMode
                  ? "bg-green-900"
                  : "bg-green-100"
                : ""
            }`}
          >
            <button
              onClick={() => onPick(roundName, index, team)}
              disabled={!team || team.isPlaceholder}
              className={`flex-1 text-left text-sm transition ${
                darkMode
                  ? "text-white hover:text-blue-300"
                  : "text-black hover:text-blue-700"
              } ${team?.isPlaceholder ? "cursor-not-allowed opacity-60" : ""}`}
            >
              <MiniTeam team={team} darkMode={darkMode} />
            </button>

            {matchIsAssigned && (
              <input
                type="number"
                min="0"
                value={scoreValue}
                onChange={e =>
                  onScoreChange(roundName, index, teamIndex, e.target.value)
                }
                onClick={e => e.stopPropagation()}
                className={`ml-2 h-8 w-10 rounded-md border text-center text-sm font-bold outline-none transition ${
                  darkMode
                    ? "bg-slate-700 border-slate-500 text-white"
                    : "bg-white border-gray-300 text-black"
                }`}
              />
            )}
          </div>
        );
      })}

      {hasPens && (
        <div
          className={`h-[24%] flex items-center justify-center border-t text-center text-[10px] leading-none font-extrabold px-1 whitespace-nowrap ${
            darkMode
              ? "border-slate-600 text-yellow-300"
              : "border-gray-200 text-yellow-700"
          }`}
        >
          {match.penaltyText}
        </div>
      )}
    </div>
  );
}

function FlagImage({ flagCode, className = "" }) {
    if (!flagCode) return null;
  
    const normalizedFlagCode = flagCode.toLowerCase();
  
    return (
      <img
        src={`/flags-png/4x3/${normalizedFlagCode}.png`}
        alt=""
        draggable="false"
        className={`object-cover rounded-sm align-middle ${className}`}
      />
    );
  }

function MiniTeam({ team, darkMode }) {
  if (!team) {
    return <span className="text-gray-400">TBD</span>;
  }

  if (team.isPlaceholder) {
    return (
        <span className="flex items-center gap-2 leading-none">
          <span className="flex h-5 w-6 items-center justify-center shrink-0">
            <FlagImage
              flagCode={team.flagCode}
              className="w-6 h-4 block shrink-0"
            />
          </span>
      
          <span
            className={`font-extrabold text-base leading-none ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            {team.fifaCode}
          </span>
        </span>
      );
  }

  return (
    <span className="flex items-center gap-2">
      <FlagImage flagCode={team.flagCode} className="w-5 h-4 shrink-0" />

      <span
        className={`font-extrabold text-base ${
          darkMode ? "text-white" : "text-black"
        }`}
      >
        {team.fifaCode}
      </span>
    </span>
  );
}

function BracketLines() {
  const lines = [];
  const straightLines = [];

  function rightEdge(side, round, index) {
    const p = positions[side][round];

    return {
      x: p.x + CARD_W,
      y: p.y[index] + META_H + CARD_H / 2
    };
  }

  function leftEdge(side, round, index) {
    const p = positions[side][round];

    return {
      x: p.x,
      y: p.y[index] + META_H + CARD_H / 2
    };
  }

  function addLeftPair(fromRound, toRound, fromA, fromB, to) {
    const a = rightEdge("left", fromRound, fromA);
    const b = rightEdge("left", fromRound, fromB);
    const t = leftEdge("left", toRound, to);

    lines.push([a.x, a.y, t.x, t.y]);
    lines.push([b.x, b.y, t.x, t.y]);
  }

  function addRightPair(fromRound, toRound, fromA, fromB, to) {
    const a = leftEdge("right", fromRound, fromA);
    const b = leftEdge("right", fromRound, fromB);
    const t = rightEdge("right", toRound, to);

    lines.push([a.x, a.y, t.x, t.y]);
    lines.push([b.x, b.y, t.x, t.y]);
  }

  addLeftPair("roundOf32", "roundOf16", 0, 1, 0);
  addLeftPair("roundOf32", "roundOf16", 2, 3, 1);
  addLeftPair("roundOf32", "roundOf16", 4, 5, 2);
  addLeftPair("roundOf32", "roundOf16", 6, 7, 3);

  addLeftPair("roundOf16", "quarterFinals", 0, 1, 0);
  addLeftPair("roundOf16", "quarterFinals", 2, 3, 1);

  addLeftPair("quarterFinals", "semiFinals", 0, 1, 0);

  addRightPair("roundOf32", "roundOf16", 0, 1, 0);
  addRightPair("roundOf32", "roundOf16", 2, 3, 1);
  addRightPair("roundOf32", "roundOf16", 4, 5, 2);
  addRightPair("roundOf32", "roundOf16", 6, 7, 3);

  addRightPair("roundOf16", "quarterFinals", 0, 1, 0);
  addRightPair("roundOf16", "quarterFinals", 2, 3, 1);

  addRightPair("quarterFinals", "semiFinals", 0, 1, 0);

  const leftSemi = rightEdge("left", "semiFinals", 0);
  const rightSemi = leftEdge("right", "semiFinals", 0);

  const finalY = positions.center.final.y + 48 + CARD_H / 2;
  const finalLeftX = positions.center.final.x;
  const finalRightX = positions.center.final.x + CARD_W;

  straightLines.push([leftSemi.x, finalY, finalLeftX, finalY]);
  straightLines.push([finalRightX, finalY, rightSemi.x, finalY]);

  return (
    <svg className="absolute inset-0 pointer-events-none" width="1810" height="1330">
      {lines.map(([x1, y1, x2, y2], i) => (
        <BracketSvgLine key={`routed-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />
      ))}

      {straightLines.map(([x1, y1, x2, y2], i) => (
        <line
          key={`straight-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#cbd5e1"
          strokeWidth="2"
        />
      ))}
    </svg>
  );
}

function BracketSvgLine({ x1, y1, x2, y2 }) {
  const midX = x1 < x2 ? x1 + 24 : x1 - 24;

  return (
    <path
      d={`M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`}
      fill="none"
      stroke="#cbd5e1"
      strokeWidth="2"
    />
  );
}