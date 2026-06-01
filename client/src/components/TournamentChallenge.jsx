import GroupStage from "./GroupStage";

import { officialGroupStandings, officialThirdPlaceAdvancers } from "../data/officialResults";
import { scoreGroupChallenge } from "../logic/challengeScoring";

/*
const TOURNAMENT_CHALLENGE_LOCK_TIME = new Date(
  "2026-06-11T15:00:00-05:00"
);
*/

// TEST MODE:
const TOURNAMENT_CHALLENGE_LOCK_TIME = new Date(Date.now() - 60 * 60 * 1000);

function isTournamentChallengeLocked() {
  return new Date() >= TOURNAMENT_CHALLENGE_LOCK_TIME;
}

export default function TournamentChallenge({
  groups,
  setGroups,
  selectedThirdPlaceCodes,
  setSelectedThirdPlaceCodes,
  onGenerateBracket,
  darkMode
}) {
  const locked = isTournamentChallengeLocked();

  const scoreResult = locked
    ? scoreGroupChallenge(
        groups,
        officialGroupStandings,
        selectedThirdPlaceCodes,
        officialThirdPlaceAdvancers
      )
    : null;

  function goToBracketChallenge() {
    if (onGenerateBracket) {
      onGenerateBracket();
    }
  }

  return (
    <div className="space-y-8">
      {locked && (
        <div
          className={`rounded-2xl border p-4 font-bold ${
            darkMode
              ? "border-yellow-500 bg-yellow-500/10 text-yellow-300"
              : "border-yellow-400 bg-yellow-100 text-yellow-900"
          }`}
        >
          Tournament Challenge is locked.
          <br />
          You can still view your picks and score, but group-stage editing is disabled.
          Use Bracket Challenge when the knockout bracket opens.
        </div>
      )}

      {scoreResult && (
        <div
          className={`rounded-3xl p-6 ${
            darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          }`}
        >
          <div className="flex items-center justify-between gap-4 mb-4">
            <h2 className="text-3xl font-extrabold">
              Tournament Challenge Score
            </h2>

            <div className="rounded-full bg-green-600 text-white px-6 py-3 text-2xl font-extrabold">
              {scoreResult.totalPoints} pts
            </div>
          </div>

          <p className={darkMode ? "text-slate-300" : "text-slate-600"}>
            Correct group picks are marked with a green check. Incorrect picks are
            marked with a red X and show the correct team. Third-place picks are
            scored separately in the 8/12 section.
          </p>
        </div>
      )}

      <GroupStage
        groups={groups}
        setGroups={setGroups}
        selectedThirdPlaceCodes={selectedThirdPlaceCodes}
        setSelectedThirdPlaceCodes={setSelectedThirdPlaceCodes}
        onGenerateBracket={goToBracketChallenge}
        darkMode={darkMode}
        scoreResult={scoreResult}
        officialGroupStandings={officialGroupStandings}
        tournamentChallengeMode={true}
        tournamentChallengeLocked={locked}
        topGenerateButtonLabel="Bracket Challenge"
        bottomGenerateButtonLabel="Play Bracket Challenge"
      />
    </div>
  );
}