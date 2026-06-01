import { useEffect, useState } from "react";

import GroupStage from "./components/GroupStage";
import ExpertGroupStage from "./components/ExpertGroupStage";
import Bracket from "./components/Bracket";
import TournamentChallenge from "./components/TournamentChallenge";
import BracketChallenge from "./components/BracketChallenge";

import {
  generateInitialBracket,
  getOfficialBracketFromGroups
} from "./logic/worldCupLogic";

import {
  initialGroups,
  initialChallengeGroups
} from "./data/groups";

import {
  officialGroupStandings,
  officialThirdPlaceAdvancers
} from "./data/officialResults";

import { scoreGroupChallenge } from "./logic/challengeScoring";

const fifaRankPower = {
  ESP: 1, ARG: 2, FRA: 3, ENG: 4, BRA: 5, POR: 6, NED: 7, BEL: 8, GER: 9,
  CRO: 10, MAR: 11, COL: 13, USA: 14, MEX: 15, URU: 16, SUI: 20, JPN: 21,
  SEN: 22, IRN: 24, KOR: 25, AUS: 26, SWE: 27, ECU: 28, AUT: 29, TUR: 30,
  NOR: 32, QAT: 48, CIV: 50, SCO: 51, ALG: 52, EGY: 53, KSA: 56, CHI: 58,
  RSA: 60, PAR: 62, UZB: 64, BIH: 66, PAN: 67, GHA: 70, CZE: 72, JOR: 75,
  HAI: 82, NZL: 88, CPV: 94, IRQ: 96, TUN: 99, COD: 105, CUW: 110
};

export default function App() {
  const [activeTab, setActiveTab] = useState("group-stage");
  const [groupStageMode, setGroupStageMode] = useState(null);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("wc-dark-mode");

    if (saved !== null) return JSON.parse(saved);

    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  });

  const [groups, setGroups] = useState(() => structuredClone(initialGroups));
  const [selectedThirdPlaceCodes, setSelectedThirdPlaceCodes] = useState([]);
  const [bracket, setBracket] = useState(null);

  const [challengeGroups, setChallengeGroups] = useState(() =>
    structuredClone(initialChallengeGroups)
  );
  const [challengeThirdPlaceCodes, setChallengeThirdPlaceCodes] = useState([]);
  const [challengeBracket, setChallengeBracket] = useState(null);

  const tournamentChallengeScore = scoreGroupChallenge(
    challengeGroups,
    officialGroupStandings,
    challengeThirdPlaceCodes,
    officialThirdPlaceAdvancers
  ).totalPoints;

  const bracketChallengeScore = 0;

  const userRankings = [
    {
      name: "Alex",
      points: tournamentChallengeScore + bracketChallengeScore
    },
    {
      name: "Guest Fan",
      points: 0
    }
  ].sort((a, b) => b.points - a.points);

  useEffect(() => {
    localStorage.setItem("wc-dark-mode", JSON.stringify(darkMode));
  }, [darkMode]);

  function weightedRandomSort(groupTeams) {
    return [...groupTeams]
      .map(team => {
        const rank = fifaRankPower[team.fifaCode] || 120;

        return {
          team,
          score: 1 / Math.pow(rank, 0.75) + Math.random() * 0.38
        };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.team);
  }

  function autofillCasualGroups() {
    const randomizedGroups = groups.map(group => {
      const sourceTeams = group.originalTeams || group.teams;

      return {
        ...group,
        originalTeams: sourceTeams,
        teams: weightedRandomSort(sourceTeams)
      };
    });

    setGroups(randomizedGroups);
    setSelectedThirdPlaceCodes([]);
    setBracket(null);
  }

  function autofillCasualThirdPlaceTeams() {
    const thirdPlaceTeams = groups.map(group => ({
      ...group.teams[2],
      groupLetter: group.name.replace("Group ", "").trim()
    }));

    const selectedCodes = thirdPlaceTeams
      .map(team => {
        const rank = fifaRankPower[team.fifaCode] || 120;

        return {
          team,
          score: 1 / Math.pow(rank, 0.45) + Math.random() * 0.55
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(item => item.team.fifaCode);

    setSelectedThirdPlaceCodes(selectedCodes);
  }

  function handleGenerateBracket() {
    if (selectedThirdPlaceCodes.length !== 8) {
      alert("Select 8 third-place teams");
      return;
    }

    const officialMatchups = getOfficialBracketFromGroups(
      groups,
      selectedThirdPlaceCodes
    );

    setBracket(generateInitialBracket(officialMatchups));
    setActiveTab("bracket");
  }

  function handleGenerateChallengeBracket() {
    if (challengeThirdPlaceCodes.length !== 8) {
      alert("Select 8 third-place teams");
      return;
    }

    const officialMatchups = getOfficialBracketFromGroups(
      challengeGroups,
      challengeThirdPlaceCodes
    );

    setChallengeBracket(generateInitialBracket(officialMatchups));
    setActiveTab("bracket-challenge");
  }

  function handleReset() {
    setGroups(structuredClone(initialGroups));
    setSelectedThirdPlaceCodes([]);
    setBracket(null);

    setChallengeGroups(structuredClone(initialChallengeGroups));
    setChallengeThirdPlaceCodes([]);
    setChallengeBracket(null);

    setGroupStageMode(null);
    setActiveTab("group-stage");
  }

  async function captureBracketCanvas() {
    const element = document.getElementById("bracket-root");

    if (!element) {
      alert("Generate or open a bracket first!");
      return null;
    }

    const html2canvas = (await import("html2canvas")).default;

    return html2canvas(element, {
      backgroundColor: darkMode ? "#0f172a" : "#ffffff",
      scale: 2,
      useCORS: true,
      width: 1810,
      height: 1330,
      windowWidth: 1810,
      windowHeight: 1330,
      scrollX: 0,
      scrollY: 0
    });
  }

  async function downloadBracketImage() {
    const canvas = await captureBracketCanvas();

    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "world-cup-bracket.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  async function shareBracket() {
    const canvas = await captureBracketCanvas();

    if (!canvas) return;

    canvas.toBlob(async blob => {
      if (!blob) return;

      const file = new File([blob], "world-cup-bracket.png", {
        type: "image/png"
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "My 2026 World Cup Prediction!",
          files: [file]
        });
      } else {
        alert("Sharing is not supported on this device/browser.");
      }
    });
  }

  function tabClass(active, color) {
    const base = "rounded-full px-6 py-3 font-bold transition shadow-lg";

    const variants = {
      yellow: active
        ? "bg-yellow-400 text-slate-900"
        : "bg-white text-slate-900 hover:bg-yellow-100",
      white: active
        ? "bg-blue-600 text-white"
        : "bg-white text-slate-900 hover:bg-slate-100",
      red: "bg-red-500 text-white hover:bg-red-600",
      green: "bg-green-500 text-white hover:bg-green-600",
      blue: "bg-blue-500 text-white hover:bg-blue-600"
    };

    return `${base} ${variants[color]}`;
  }

  const appBg = darkMode
    ? "bg-[#020b2d] text-white"
    : "bg-slate-100 text-slate-900";

  return (
    <div className={`min-h-screen transition ${appBg}`}>
      <div className="max-w-[1800px] mx-auto px-4 py-6">
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4">
            2026 World Cup Simulator
          </h1>

          <p
            className={`text-lg md:text-2xl ${
              darkMode ? "text-slate-300" : "text-slate-700"
            }`}
          >
            Fill out the group stages and freely navigate your tournament path
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <button
            onClick={() => setActiveTab("group-stage")}
            className={tabClass(activeTab === "group-stage", "yellow")}
          >
            Tournament Simulator
          </button>

          <button
            style={{ display: "none" }}
            onClick={() => setActiveTab("tournament")}
            className={tabClass(activeTab === "tournament", "white")}
          >
            Tournament Challenge
          </button>

          <button
            style={{ display: "none" }}
            onClick={() => setActiveTab("bracket-challenge")}
            className={tabClass(activeTab === "bracket-challenge", "white")}
          >
            Bracket Challenge
          </button>

          <button
            onClick={downloadBracketImage}
            className={tabClass(false, "green")}
          >
            Download Image
          </button>

          <button onClick={shareBracket} className={tabClass(false, "blue")}>
            Share Bracket
          </button>
          
          <button onClick={handleReset} className={tabClass(false, "red")}>
            Restart Tournament
          </button>

          <button
            onClick={() => setDarkMode(prev => !prev)}
            className={tabClass(false, "white")}
          >
            {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
          </button>
        </div>

        {activeTab === "group-stage" && !groupStageMode && (
          <div
            className={`rounded-3xl p-10 text-center ${
              darkMode ? "bg-slate-900" : "bg-white"
            }`}
          >
            <h2 className="text-5xl font-extrabold mb-5">
              Choose Your Simulator Experience
            </h2>

            <p
              className={`mb-10 text-xl ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Casual Mode is quick and simple while Expert Mode is more complex and takes longer to fill out
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setGroupStageMode("casual")}
                className="rounded-3xl p-12 bg-blue-600 hover:bg-blue-700 text-white transition"
              >
                <div className="text-5xl font-extrabold mb-3">
                  Casual Mode
                </div>

                <div className="text-xl text-blue-100">
                  Click to order, drag to reorder group standings, choose or autofill 8-random third place teams then fillout your bracket
                </div>
              </button>

              <button
                onClick={() => setGroupStageMode("expert")}
                className="rounded-3xl p-12 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:opacity-90 text-white transition"
              >
                <div className="text-5xl font-extrabold mb-3">
                  Expert Mode
                </div>

                <div className="text-xl text-purple-100">
                  Predict or simulate every individual matchup with the official FIFA rules and tiebreakers in-place. Every third-place team is ranked where the best 8 will be provided based on official rules.
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === "group-stage" && groupStageMode === "casual" && (
          <GroupStage
            groups={groups}
            setGroups={setGroups}
            selectedThirdPlaceCodes={selectedThirdPlaceCodes}
            setSelectedThirdPlaceCodes={setSelectedThirdPlaceCodes}
            onGenerateBracket={handleGenerateBracket}
            onAutofillGroups={autofillCasualGroups}
            onAutofillThirdPlaceTeams={autofillCasualThirdPlaceTeams}
            darkMode={darkMode}
          />
        )}

        {activeTab === "group-stage" && groupStageMode === "expert" && (
          <ExpertGroupStage
            groups={groups}
            setGroups={setGroups}
            selectedThirdPlaceCodes={selectedThirdPlaceCodes}
            setSelectedThirdPlaceCodes={setSelectedThirdPlaceCodes}
            onGenerateBracket={handleGenerateBracket}
            darkMode={darkMode}
          />
        )}

        {activeTab === "bracket" &&
          (bracket ? (
            <Bracket
              bracket={bracket}
              setBracket={setBracket}
              darkMode={darkMode}
            />
          ) : (
            <div
              className={`rounded-3xl p-16 text-center ${
                darkMode ? "bg-slate-900" : "bg-white"
              }`}
            >
              <h2 className="text-5xl font-extrabold mb-4">
                Generate Your Bracket
              </h2>

              <p
                className={`text-xl ${
                  darkMode ? "text-slate-300" : "text-slate-600"
                }`}
              >
                Complete the tournament simulator first to generate the knockout
                bracket.
              </p>
            </div>
          ))}

        {activeTab === "tournament" && (
          <TournamentChallenge
            groups={challengeGroups}
            setGroups={setChallengeGroups}
            selectedThirdPlaceCodes={challengeThirdPlaceCodes}
            setSelectedThirdPlaceCodes={setChallengeThirdPlaceCodes}
            onGenerateBracket={handleGenerateChallengeBracket}
            darkMode={darkMode}
          />
        )}

        {activeTab === "bracket-challenge" && (
          <BracketChallenge
            bracket={challengeBracket}
            setBracket={setChallengeBracket}
            darkMode={darkMode}
          />
        )}

        {(activeTab === "tournament" || activeTab === "bracket-challenge") && (
          <div className="mt-10">
            <div
              className={`rounded-3xl p-6 ${
                darkMode ? "bg-slate-800 text-white" : "bg-white text-slate-900"
              }`}
            >
              <h2 className="text-3xl font-extrabold mb-4">User Rankings</h2>

              <div className="space-y-4">
                {userRankings.map((user, index) => (
                  <div
                    key={user.name}
                    className={`rounded-2xl p-4 flex justify-between ${
                      darkMode ? "bg-slate-900" : "bg-slate-100"
                    }`}
                  >
                    <span className="font-bold">
                      #{index + 1} {user.name}
                    </span>

                    <span className="font-extrabold text-blue-500">
                      {user.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}