import { useEffect, useMemo, useState } from "react";
import "flag-icons/css/flag-icons.min.css";

const fifaRankPower = {
  ESP: 1, ARG: 2, FRA: 3, ENG: 4, BRA: 5, POR: 6, NED: 7, BEL: 8, GER: 9,
  CRO: 10, MAR: 11, COL: 13, USA: 14, MEX: 15, URU: 16, SUI: 20, JPN: 21,
  SEN: 22, IRN: 24, KOR: 25, AUS: 26, SWE: 27, ECU: 28, AUT: 29, TUR: 30,
  NOR: 32, QAT: 48, CIV: 50, SCO: 51, ALG: 52, EGY: 53, KSA: 56, CHI: 58,
  RSA: 60, PAR: 62, UZB: 64, BIH: 66, PAN: 67, GHA: 70, CZE: 72, JOR: 75,
  HAI: 82, NZL: 88, CPV: 94, IRQ: 96, TUN: 99, COD: 105, CUW: 110
};

const GROUP_SCHEDULES = {
  A: [
    ["MD1", "Jun 11", "3PM", "Mexico City", "MEX", "RSA"],
    ["MD1", "Jun 11", "10PM", "Guadalajara", "KOR", "CZE"],
    ["MD2", "Jun 18", "12PM", "Atlanta", "CZE", "RSA"],
    ["MD2", "Jun 18", "9PM", "Guadalajara", "MEX", "KOR"],
    ["MD3", "Jun 24", "9PM", "Mexico City", "CZE", "MEX"],
    ["MD3", "Jun 24", "9PM", "Monterrey", "RSA", "KOR"]
  ],
  B: [
    ["MD1", "Jun 12", "3PM", "Toronto", "CAN", "BIH"],
    ["MD1", "Jun 12", "3PM", "San Francisco", "QAT", "SUI"],
    ["MD2", "Jun 18", "3PM", "Los Angeles", "SUI", "BIH"],
    ["MD2", "Jun 18", "10PM", "Vancouver", "CAN", "QAT"],
    ["MD3", "Jun 24", "9PM", "Vancouver", "SUI", "CAN"],
    ["MD3", "Jun 24", "9PM", "Seattle", "BIH", "QAT"]
  ],
  C: [
    ["MD1", "Jun 13", "6PM", "New York", "BRA", "MAR"],
    ["MD1", "Jun 13", "10PM", "Boston", "HAI", "SCO"],
    ["MD2", "Jun 19", "3PM", "Boston", "SCO", "MAR"],
    ["MD2", "Jun 19", "9PM", "Philadelphia", "BRA", "HAI"],
    ["MD3", "Jun 25", "9PM", "Miami", "SCO", "BRA"],
    ["MD3", "Jun 25", "9PM", "Atlanta", "MAR", "HAI"]
  ],
  D: [
    ["MD1", "Jun 12", "9PM", "Los Angeles", "USA", "PAR"],
    ["MD1", "Jun 13", "6PM", "Vancouver", "AUS", "TUR"],
    ["MD2", "Jun 19", "3PM", "Seattle", "USA", "AUS"],
    ["MD2", "Jun 19", "9PM", "San Francisco", "TUR", "PAR"],
    ["MD3", "Jun 25", "9PM", "Los Angeles", "TUR", "USA"],
    ["MD3", "Jun 25", "9PM", "San Francisco", "PAR", "AUS"]
  ],
  E: [
    ["MD1", "Jun 14", "12PM", "Houston", "GER", "CUW"],
    ["MD1", "Jun 14", "9PM", "Philadelphia", "CIV", "ECU"],
    ["MD2", "Jun 20", "12PM", "Toronto", "GER", "CIV"],
    ["MD2", "Jun 20", "8PM", "Kansas City", "ECU", "CUW"],
    ["MD3", "Jun 26", "9PM", "Philadelphia", "CUW", "CIV"],
    ["MD3", "Jun 26", "9PM", "New York", "ECU", "GER"]
  ],
  F: [
    ["MD1", "Jun 14", "3PM", "Dallas", "NED", "JPN"],
    ["MD1", "Jun 14", "10PM", "Monterrey", "SWE", "TUN"],
    ["MD2", "Jun 20", "2PM", "Houston", "NED", "SWE"],
    ["MD2", "Jun 20", "9PM", "Monterrey", "TUN", "JPN"],
    ["MD3", "Jun 26", "9PM", "Dallas", "JPN", "SWE"],
    ["MD3", "Jun 26", "9PM", "Kansas City", "TUN", "NED"]
  ],
  G: [
    ["MD1", "Jun 15", "12PM", "Seattle", "BEL", "EGY"],
    ["MD1", "Jun 15", "9PM", "Los Angeles", "IRN", "NZL"],
    ["MD2", "Jun 21", "2PM", "Los Angeles", "BEL", "IRN"],
    ["MD2", "Jun 21", "9PM", "Vancouver", "NZL", "EGY"],
    ["MD3", "Jun 27", "9PM", "Seattle", "EGY", "IRN"],
    ["MD3", "Jun 27", "9PM", "Vancouver", "NZL", "BEL"]
  ],
  H: [
    ["MD1", "Jun 15", "12PM", "Atlanta", "ESP", "CPV"],
    ["MD1", "Jun 15", "9PM", "Miami", "KSA", "URU"],
    ["MD2", "Jun 21", "12PM", "Atlanta", "ESP", "KSA"],
    ["MD2", "Jun 21", "8PM", "Miami", "URU", "CPV"],
    ["MD3", "Jun 27", "9PM", "Houston", "CPV", "KSA"],
    ["MD3", "Jun 27", "9PM", "Guadalajara", "URU", "ESP"]
  ]
};

const GROUP_DATE_CITY_SLOTS = {
  I: [
    ["MD1", "Jun 16", "3PM", "New York"],
    ["MD1", "Jun 16", "9PM", "Boston"],
    ["MD2", "Jun 22", "3PM", "Philadelphia"],
    ["MD2", "Jun 22", "8PM", "New York"],
    ["MD3", "Jun 28", "9PM", "Boston"],
    ["MD3", "Jun 28", "9PM", "Toronto"]
  ],
  J: [
    ["MD1", "Jun 16", "12PM", "Kansas City"],
    ["MD1", "Jun 16", "9PM", "San Francisco"],
    ["MD2", "Jun 22", "12PM", "Dallas"],
    ["MD2", "Jun 22", "8PM", "San Francisco"],
    ["MD3", "Jun 28", "9PM", "Kansas City"],
    ["MD3", "Jun 28", "9PM", "Dallas"]
  ],
  K: [
    ["MD1", "Jun 17", "3PM", "Houston"],
    ["MD1", "Jun 17", "9PM", "Mexico City"],
    ["MD2", "Jun 23", "2PM", "Houston"],
    ["MD2", "Jun 23", "9PM", "Guadalajara"],
    ["MD3", "Jun 29", "9PM", "Miami"],
    ["MD3", "Jun 29", "9PM", "Atlanta"]
  ],
  L: [
    ["MD1", "Jun 17", "12PM", "Dallas"],
    ["MD1", "Jun 17", "9PM", "Toronto"],
    ["MD2", "Jun 23", "1PM", "Boston"],
    ["MD2", "Jun 23", "8PM", "Toronto"],
    ["MD3", "Jun 29", "9PM", "New York"],
    ["MD3", "Jun 29", "9PM", "Philadelphia"]
  ]
};

function getGroupSchedule(group) {
  const letter = group.name.replace("Group ", "").trim();
  const teams = group.originalTeams || group.teams;

  const positionMatchups = [
    [0, 1],
    [2, 3],
    [0, 2],
    [3, 1],
    [3, 0],
    [1, 2]
  ];

  if (["I", "J", "K", "L"].includes(letter)) {
    return GROUP_DATE_CITY_SLOTS[letter].map(([md, date, time, city], index) => {
      const [aIndex, bIndex] = positionMatchups[index];

      return {
        md,
        date,
        time,
        city,
        teamAObj: teams[aIndex],
        teamBObj: teams[bIndex]
      };
    });
  }

  const byCode = Object.fromEntries(teams.map(team => [team.fifaCode, team]));
  const raw = GROUP_SCHEDULES[letter] || [];

  return raw
    .map(([md, date, time, city, teamA, teamB]) => ({
      md,
      date,
      time,
      city,
      teamAObj: byCode[teamA],
      teamBObj: byCode[teamB]
    }))
    .filter(match => match.teamAObj && match.teamBObj);
}

function emptyResult() {
  return { scoreA: "", scoreB: "" };
}

function getRandomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getWinScore(winnerTeam, loserTeam) {
  const winnerRank = fifaRankPower[winnerTeam.fifaCode] || 120;
  const loserRank = fifaRankPower[loserTeam.fifaCode] || 120;

  const rankGap = loserRank - winnerRank;
  const isUpset = winnerRank > loserRank;
  const upsetGap = winnerRank - loserRank;

  if (isUpset && upsetGap >= 20) {
    return getRandomItem([
      [1, 0],
      [2, 1],
      [3, 2]
    ]);
  }

  if (rankGap >= 45) {
    return getRandomItem([
      [3, 0],
      [4, 0],
      [4, 1],
      [5, 0],
      [5, 1]
    ]);
  }

  if (rankGap >= 20) {
    return getRandomItem([
      [2, 0],
      [2, 1],
      [3, 1],
      [3, 2]
    ]);
  }

  return getRandomItem([
    [1, 0],
    [2, 1],
    [3, 2]
  ]);
}

function getRandomDrawScore() {
  return getRandomItem([0, 1, 2, 3]);
}

function groupBy(items, getKey) {
  return items.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function rankTiedTeams(teams, completedMatches) {
  const teamCodes = new Set(teams.map(team => team.fifaCode));

  const h2hStats = Object.fromEntries(
    teams.map(team => [
      team.fifaCode,
      {
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0
      }
    ])
  );

  completedMatches.forEach(match => {
    if (!teamCodes.has(match.codeA) || !teamCodes.has(match.codeB)) return;

    const a = h2hStats[match.codeA];
    const b = h2hStats[match.codeB];

    a.goalsFor += match.scoreA;
    a.goalsAgainst += match.scoreB;

    b.goalsFor += match.scoreB;
    b.goalsAgainst += match.scoreA;

    if (match.scoreA > match.scoreB) {
      a.points += 3;
    } else if (match.scoreB > match.scoreA) {
      b.points += 3;
    } else {
      a.points += 1;
      b.points += 1;
    }
  });

  Object.values(h2hStats).forEach(stat => {
    stat.goalDifference = stat.goalsFor - stat.goalsAgainst;
  });

  return [...teams].sort((a, b) => {
    if (h2hStats[b.fifaCode].points !== h2hStats[a.fifaCode].points) {
      return h2hStats[b.fifaCode].points - h2hStats[a.fifaCode].points;
    }

    if (
      h2hStats[b.fifaCode].goalDifference !==
      h2hStats[a.fifaCode].goalDifference
    ) {
      return (
        h2hStats[b.fifaCode].goalDifference -
        h2hStats[a.fifaCode].goalDifference
      );
    }

    if (h2hStats[b.fifaCode].goalsFor !== h2hStats[a.fifaCode].goalsFor) {
      return h2hStats[b.fifaCode].goalsFor - h2hStats[a.fifaCode].goalsFor;
    }

    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }

    if (b.goalsFor !== a.goalsFor) {
      return b.goalsFor - a.goalsFor;
    }

    return (
      (fifaRankPower[a.fifaCode] || 999) -
      (fifaRankPower[b.fifaCode] || 999)
    );
  });
}

function rankTeamsWithFifaTiebreakers(rows, completedMatches) {
  const pointGroups = groupBy(rows, team => team.points);

  return Object.keys(pointGroups)
    .map(Number)
    .sort((a, b) => b - a)
    .flatMap(points => {
      const tiedTeams = pointGroups[points];

      return tiedTeams.length === 1
        ? tiedTeams
        : rankTiedTeams(tiedTeams, completedMatches);
    });
}

function calculateTable(group, results) {
  const sourceTeams = group.originalTeams || group.teams;

  const rows = sourceTeams.map(team => ({
    ...team,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0
  }));

  const byCode = Object.fromEntries(rows.map(row => [row.fifaCode, row]));
  const matches = getGroupSchedule(group);
  const completedMatches = [];

  matches.forEach((match, index) => {
    const result = results?.[index];

    if (
      !match.teamAObj ||
      !match.teamBObj ||
      !result ||
      result.scoreA === "" ||
      result.scoreB === "" ||
      Number.isNaN(Number(result.scoreA)) ||
      Number.isNaN(Number(result.scoreB))
    ) {
      return;
    }

    const scoreA = Number(result.scoreA);
    const scoreB = Number(result.scoreB);

    const rowA = byCode[match.teamAObj.fifaCode];
    const rowB = byCode[match.teamBObj.fifaCode];

    rowA.played += 1;
    rowB.played += 1;

    rowA.goalsFor += scoreA;
    rowA.goalsAgainst += scoreB;

    rowB.goalsFor += scoreB;
    rowB.goalsAgainst += scoreA;

    if (scoreA > scoreB) {
      rowA.wins += 1;
      rowB.losses += 1;
      rowA.points += 3;
    } else if (scoreB > scoreA) {
      rowB.wins += 1;
      rowA.losses += 1;
      rowB.points += 3;
    } else {
      rowA.draws += 1;
      rowB.draws += 1;
      rowA.points += 1;
      rowB.points += 1;
    }

    completedMatches.push({
      codeA: match.teamAObj.fifaCode,
      codeB: match.teamBObj.fifaCode,
      scoreA,
      scoreB
    });
  });

  rows.forEach(row => {
    row.goalDifference = row.goalsFor - row.goalsAgainst;
  });

  return rankTeamsWithFifaTiebreakers(rows, completedMatches);
}

function rankExpertThirdPlaceTeams(groups, standingsByGroup) {
  return groups
    .map(group => {
      const thirdPlaceTeam = standingsByGroup[group.id]?.[2];

      if (!thirdPlaceTeam) return null;

      return {
        ...thirdPlaceTeam,
        groupId: group.id,
        groupName: group.name
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;

      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      if (b.goalsFor !== a.goalsFor) {
        return b.goalsFor - a.goalsFor;
      }

      return (
        (fifaRankPower[a.fifaCode] || 999) -
        (fifaRankPower[b.fifaCode] || 999)
      );
    });
}

export default function ExpertGroupStage({
  groups,
  setGroups,
  selectedThirdPlaceCodes,
  setSelectedThirdPlaceCodes,
  onGenerateBracket,
  darkMode
}) {
  const [results, setResults] = useState(() => {
    const initial = {};

    groups.forEach(group => {
      initial[group.id] = Array.from({ length: 6 }, () => emptyResult());
    });

    return initial;
  });

  const standingsByGroup = useMemo(() => {
    const next = {};

    groups.forEach(group => {
      next[group.id] = calculateTable(group, results[group.id]);
    });

    return next;
  }, [groups, results]);

  useEffect(() => {
    setGroups(prev =>
      prev.map(group => {
        const sourceTeams = group.originalTeams || group.teams;
        const standings = calculateTable(group, results[group.id]);

        return {
          ...group,
          originalTeams: sourceTeams,
          teams: standings.map(team => ({
            name: team.name,
            fifaCode: team.fifaCode,
            flagCode: team.flagCode
          }))
        };
      })
    );
  }, [results, setGroups]);

  const rankedThirdPlaceTeams = useMemo(() => {
    return rankExpertThirdPlaceTeams(groups, standingsByGroup);
  }, [groups, standingsByGroup]);

  const autoSelectedThirdPlaceCodes = useMemo(() => {
    return rankedThirdPlaceTeams.slice(0, 8).map(team => team.fifaCode);
  }, [rankedThirdPlaceTeams]);

  useEffect(() => {
    setSelectedThirdPlaceCodes(prev => {
      const previous = prev.join("|");
      const next = autoSelectedThirdPlaceCodes.join("|");

      return previous === next ? prev : autoSelectedThirdPlaceCodes;
    });
  }, [autoSelectedThirdPlaceCodes, setSelectedThirdPlaceCodes]);

  const canGenerate = autoSelectedThirdPlaceCodes.length === 8;

  function updateScore(groupId, matchIndex, side, value) {
    const cleanValue = value === "" ? "" : Math.max(0, Number(value));

    setResults(prev => {
      const groupResults =
        prev[groupId] || Array.from({ length: 6 }, () => emptyResult());

      const nextGroupResults = [...groupResults];

      nextGroupResults[matchIndex] = {
        ...nextGroupResults[matchIndex],
        [side]: cleanValue
      };

      return {
        ...prev,
        [groupId]: nextGroupResults
      };
    });
  }

  function quickPick(groupId, matchIndex, type) {
    const group = groups.find(g => g.id === groupId);
    const match = getGroupSchedule(group)[matchIndex];

    if (!match?.teamAObj || !match?.teamBObj) return;

    let nextScore;

    if (type === "D") {
      const drawScore = getRandomDrawScore();
      nextScore = { scoreA: drawScore, scoreB: drawScore };
    }

    if (type === "A") {
      const [winnerScore, loserScore] = getWinScore(
        match.teamAObj,
        match.teamBObj
      );

      nextScore = {
        scoreA: winnerScore,
        scoreB: loserScore
      };
    }

    if (type === "B") {
      const [winnerScore, loserScore] = getWinScore(
        match.teamBObj,
        match.teamAObj
      );

      nextScore = {
        scoreA: loserScore,
        scoreB: winnerScore
      };
    }

    setResults(prev => {
      const groupResults =
        prev[groupId] || Array.from({ length: 6 }, () => emptyResult());

      const nextGroupResults = [...groupResults];

      nextGroupResults[matchIndex] = nextScore;

      return {
        ...prev,
        [groupId]: nextGroupResults
      };
    });
  }

  function simulateRemainingFixtures() {
    setResults(prev => {
      const nextResults = { ...prev };
  
      groups.forEach(group => {
        const matches = getGroupSchedule(group);
        const groupResults =
          nextResults[group.id] || Array.from({ length: 6 }, () => emptyResult());
  
        nextResults[group.id] = groupResults.map((result, index) => {
          const alreadyPicked =
            result &&
            result.scoreA !== "" &&
            result.scoreB !== "";
  
          if (alreadyPicked) return result;
  
          const match = matches[index];
  
          if (!match?.teamAObj || !match?.teamBObj) {
            return result || emptyResult();
          }
  
          const teamARank = fifaRankPower[match.teamAObj.fifaCode] || 120;
          const teamBRank = fifaRankPower[match.teamBObj.fifaCode] || 120;
          const rankDiff = Math.abs(teamARank - teamBRank);
  
          const drawChance =
            rankDiff <= 8 ? 0.3 :
            rankDiff <= 20 ? 0.22 :
            rankDiff <= 40 ? 0.14 :
            0.08;
  
          if (Math.random() < drawChance) {
            const drawScore = getRandomDrawScore();
  
            return {
              scoreA: drawScore,
              scoreB: drawScore
            };
          }
  
          const teamAWins = teamARank < teamBRank
            ? Math.random() < 0.72
            : Math.random() < 0.28;
  
          if (teamAWins) {
            const [winnerScore, loserScore] = getWinScore(
              match.teamAObj,
              match.teamBObj
            );
  
            return {
              scoreA: winnerScore,
              scoreB: loserScore
            };
          }
  
          const [winnerScore, loserScore] = getWinScore(
            match.teamBObj,
            match.teamAObj
          );
  
          return {
            scoreA: loserScore,
            scoreB: winnerScore
          };
        });
      });
  
      return nextResults;
    });
  }

  return (
    <section
      className={`rounded-3xl shadow-2xl p-4 ${
        darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-extrabold">
            Expert Mode Predictor
          </h2>

          <p className={darkMode ? "text-slate-300" : "text-gray-600"}>
            Select the team or manually input scores to witness how the tournament plays out in real-time!
          </p>
        </div>

        <div className="flex items-center gap-3">
  <button
    onClick={simulateRemainingFixtures}
    className="rounded-full px-5 py-2 font-bold bg-purple-600 text-white hover:bg-purple-700"
  >
    Simulate Fixtures
  </button>

  <button
    onClick={onGenerateBracket}
    disabled={!canGenerate}
    className={`rounded-full px-5 py-2 font-bold ${
      canGenerate
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-gray-400 text-white cursor-not-allowed"
    }`}
  >
    Predict Bracket
  </button>
</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        {groups.map(group => {
          const matches = getGroupSchedule(group);
          const table = standingsByGroup[group.id] || [];

          return (
            <div
              key={group.id}
              className={`rounded-xl border p-1.5 ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <h3 className="text-lg font-extrabold mb-2">{group.name}</h3>

              <div
                className={`rounded-lg overflow-hidden mb-2 ${
                  darkMode ? "bg-slate-900" : "bg-white"
                }`}
              >
                <div
                  className={`grid grid-cols-[16px_1fr_20px_20px_20px_20px_20px_20px_20px_24px] gap-1 px-1.5 py-1 text-[9px] font-bold ${
                    darkMode ? "bg-slate-700" : "bg-slate-200"
                  }`}
                >
                  <div>#</div>
                  <div>Team</div>
                  <div>MP</div>
                  <div>W</div>
                  <div>D</div>
                  <div>L</div>
                  <div>GF</div>
                  <div>GA</div>
                  <div>GD</div>
                  <div>Pts</div>
                </div>

                {table.map((team, index) => (
                  <div
                    key={team.fifaCode}
                    className={`grid grid-cols-[16px_1fr_20px_20px_20px_20px_20px_20px_20px_24px] gap-1 items-center px-1.5 py-1 border-t text-[10px] ${
                      darkMode ? "border-slate-700" : "border-slate-200"
                    }`}
                  >
                    <div className="font-bold">{index + 1}</div>

                    <div className="flex items-center gap-1 font-medium min-w-0 overflow-hidden">
                      <span
                        className={`fi fi-${team.flagCode} rounded-sm flex-shrink-0`}
                      />

                      <span className="truncate text-[10px]">{team.name}</span>
                    </div>

                    <div>{team.played}</div>
                    <div>{team.wins}</div>
                    <div>{team.draws}</div>
                    <div>{team.losses}</div>
                    <div>{team.goalsFor}</div>
                    <div>{team.goalsAgainst}</div>
                    <div>{team.goalDifference}</div>
                    <div className="font-bold">{team.points}</div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                {matches.map((match, index) => {
                  const result = results[group.id]?.[index] || emptyResult();

                  return (
                    <div
                      key={`${group.id}-${index}`}
                      className={`rounded-md border px-1.5 py-1 ${
                        darkMode
                          ? "bg-slate-900 border-slate-700"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div
                        className={`mb-1 text-center text-[9px] font-bold ${
                          darkMode ? "text-blue-300" : "text-blue-700"
                        }`}
                      >
                        {match.md} · {match.date} · {match.time} · {match.city}
                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                        <TeamLabel team={match.teamAObj} align="left" />

                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            value={result.scoreA}
                            onChange={e =>
                              updateScore(
                                group.id,
                                index,
                                "scoreA",
                                e.target.value
                              )
                            }
                            className={`w-10 h-8 rounded-md border text-center text-sm font-extrabold ${
                              darkMode
                                ? "bg-slate-800 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          />

                          <span className="font-bold">-</span>

                          <input
                            type="number"
                            min="0"
                            value={result.scoreB}
                            onChange={e =>
                              updateScore(
                                group.id,
                                index,
                                "scoreB",
                                e.target.value
                              )
                            }
                            className={`w-10 h-8 rounded-md border text-center text-sm font-extrabold ${
                              darkMode
                                ? "bg-slate-800 border-slate-600 text-white"
                                : "bg-white border-slate-300 text-slate-900"
                            }`}
                          />
                        </div>

                        <TeamLabel team={match.teamBObj} align="right" />
                      </div>

                      <div className="mt-1 flex justify-center gap-1 flex-wrap">
                        <button
                          onClick={() => quickPick(group.id, index, "A")}
                          className="rounded-full bg-green-600 text-white px-2.5 py-1 text-[11px] font-extrabold"
                        >
                          {match.teamAObj.fifaCode}
                        </button>

                        <button
                          onClick={() => quickPick(group.id, index, "D")}
                          className="rounded-full bg-yellow-400 text-slate-900 px-2.5 py-1 text-[11px] font-extrabold"
                        >
                          Draw
                        </button>

                        <button
                          onClick={() => quickPick(group.id, index, "B")}
                          className="rounded-full bg-green-600 text-white px-2.5 py-1 text-[11px] font-extrabold"
                        >
                          {match.teamBObj.fifaCode}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-6 rounded-3xl border p-5 ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex justify-between items-center mb-4 gap-4">
          <div>
            <h3 className="text-xl font-extrabold">
              Ranked Third-Place Teams
            </h3>

            <p className={darkMode ? "text-slate-300" : "text-slate-600"}>
              Top 8 advance automatically using FIFA rules: points, GD, GF, then
              FIFA ranking.
            </p>
          </div>

          <div
            className={`rounded-full px-4 py-1.5 text-sm font-bold whitespace-nowrap ${
                darkMode
                ? "bg-slate-700 text-slate-200 border border-slate-600"
                : "bg-slate-200 text-slate-700 border border-slate-300"
            }`}
            >
            Top 8 advance
            </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-600">
  <table className="w-full text-sm">
    <thead className={darkMode ? "bg-slate-700" : "bg-slate-200"}>
      <tr>
        <th className="px-3 py-2 text-left">Rank</th>
        <th className="px-3 py-2 text-left">Team</th>
        <th className="px-3 py-2 text-left">Group</th>
        <th className="px-3 py-2 text-center">Pts</th>
        <th className="px-3 py-2 text-center">GD</th>
        <th className="px-3 py-2 text-center">GF</th>
        <th className="px-3 py-2 text-center">Status</th>
      </tr>
    </thead>

    <tbody>
      {rankedThirdPlaceTeams.map((team, index) => {
        const advances = index < 8;

        return (
          <tr
            key={`${team.groupId}-${team.fifaCode}`}
            className={`border-t ${
              advances
                ? "bg-green-500 text-white"
                : darkMode
                ? "bg-slate-900 text-slate-300 border-slate-700"
                : "bg-white text-slate-700 border-slate-200"
            }`}
          >
            <td className="px-3 py-2 font-extrabold">
              #{index + 1}
            </td>

            <td className="px-3 py-2">
              <div className="flex items-center gap-2 font-bold">
                <span className={`fi fi-${team.flagCode} rounded-sm`} />
                <span>{team.name}</span>
              </div>
            </td>

            <td className="px-3 py-2 font-semibold">
              {team.groupName}
            </td>

            <td className="px-3 py-2 text-center font-extrabold">
              {team.points}
            </td>

            <td className="px-3 py-2 text-center font-extrabold">
              {team.goalDifference}
            </td>

            <td className="px-3 py-2 text-center font-extrabold">
              {team.goalsFor}
            </td>

            <td className="px-3 py-2 text-center font-extrabold">
              {advances ? "Qualifies" : "Out"}
            </td>
          </tr>
        );
      })}
    </tbody>
  </table>
</div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onGenerateBracket}
            disabled={!canGenerate}
            className={`rounded-full px-8 py-4 text-lg font-bold ${
              canGenerate
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-400 text-white cursor-not-allowed"
            }`}
          >
            Predict Bracket
          </button>
        </div>
      </div>
    </section>
  );
}

function TeamLabel({ team, align }) {
  return (
    <div
      className={`flex items-center gap-1.5 font-extrabold text-xs min-w-0 ${
        align === "right" ? "justify-end" : "justify-start"
      }`}
    >
      <span
        className={`fi fi-${team.flagCode} rounded-sm text-base flex-shrink-0`}
      />

      <span>{team.fifaCode}</span>
    </div>
  );
}