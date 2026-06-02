import { useMemo, useState } from "react";
import "flag-icons/css/flag-icons.min.css";

export default function GroupStage({
  groups,
  setGroups,
  selectedThirdPlaceCodes,
  setSelectedThirdPlaceCodes,
  onGenerateBracket,
  onAutofillGroups,
  onAutofillThirdPlaceTeams,
  darkMode,
  scoreResult,
  officialGroupStandings,
  tournamentChallengeMode = false,
  tournamentChallengeLocked = false,
  topGenerateButtonLabel = "Predict Bracket",
  bottomGenerateButtonLabel = "Predict Bracket"
}) {
  const [dragState, setDragState] = useState(null);

  const thirdPlaceTeams = useMemo(() => {
    return groups
      .map(group => {
        const pickedTeams = group.originalTeams ? group.teams : [];
        const team = pickedTeams?.[2];

        if (!team) return null;

        return {
          ...team,
          groupName: group.name
        };
      })
      .filter(Boolean);
  }, [groups]);

  function getPickedTeams(group) {
    return group.originalTeams ? group.teams : [];
  }

  function getSourceTeams(group) {
    return group.originalTeams || group.teams;
  }

  function getGroupLetter(group) {
    return group.name.replace("Group ", "").trim();
  }

  function getOfficialTeamByCode(group, fifaCode) {
    const sourceTeams = getSourceTeams(group);
    return sourceTeams.find(team => team.fifaCode === fifaCode);
  }

  function getPositionScore(group, team, index) {
    if (!tournamentChallengeMode || !scoreResult || !officialGroupStandings) {
      return null;
    }

    const groupLetter = getGroupLetter(group);
    const officialCode =
      officialGroupStandings[groupLetter]?.standings?.[index]?.fifaCode;

    if (!officialCode) return null;

    const officialTeam = getOfficialTeamByCode(group, officialCode);

    return {
      correct: officialCode === team.fifaCode,
      officialTeam,
      officialCode
    };
  }

  function selectTeam(groupId, team) {
    if (tournamentChallengeLocked) return;

    setGroups(prev =>
      prev.map(group => {
        if (group.id !== groupId) return group;

        const sourceTeams = getSourceTeams(group);
        const pickedTeams = group.originalTeams ? group.teams : [];

        const alreadyPicked = pickedTeams.some(
          picked => picked.fifaCode === team.fifaCode
        );

        if (alreadyPicked) return group;

        const nextTeams = [...pickedTeams, team];

        if (nextTeams.length === 3) {
          const remainingTeam = sourceTeams.find(
            source =>
              !nextTeams.some(picked => picked.fifaCode === source.fifaCode)
          );

          if (remainingTeam) nextTeams.push(remainingTeam);
        }

        return {
          ...group,
          originalTeams: sourceTeams,
          teams: nextTeams
        };
      })
    );
  }

  function clearGroup(groupId) {
    if (tournamentChallengeLocked) return;

    setGroups(prev =>
      prev.map(group => {
        if (group.id !== groupId) return group;

        const sourceTeams = getSourceTeams(group);
        const sourceCodes = sourceTeams.map(team => team.fifaCode);

        setSelectedThirdPlaceCodes(prevCodes =>
          prevCodes.filter(code => !sourceCodes.includes(code))
        );

        return {
          ...group,
          originalTeams: sourceTeams,
          teams: []
        };
      })
    );
  }

  function moveTeamToPosition(groupId, fromIndex, toIndex) {
    if (tournamentChallengeLocked) return;
    if (fromIndex === toIndex) return;
    if (toIndex < 0 || toIndex > 3) return;

    setGroups(prev =>
      prev.map(group => {
        if (group.id !== groupId) return group;

        const pickedTeams = getPickedTeams(group);
        if (!pickedTeams[fromIndex]) return group;
        if (toIndex >= pickedTeams.length) return group;

        const nextTeams = [...pickedTeams];

        const [movedTeam] = nextTeams.splice(fromIndex, 1);
        nextTeams.splice(toIndex, 0, movedTeam);

        return {
          ...group,
          teams: nextTeams
        };
      })
    );
  }

  function handleDragStart(groupId, fromIndex) {
    if (tournamentChallengeLocked) return;

    setDragState({
      groupId,
      fromIndex
    });
  }

  function handleDrop(groupId, toIndex) {
    if (!dragState) return;
    if (dragState.groupId !== groupId) return;

    moveTeamToPosition(groupId, dragState.fromIndex, toIndex);
    setDragState(null);
  }

  function toggleThirdPlaceTeam(fifaCode) {
    if (tournamentChallengeLocked) return;

    setSelectedThirdPlaceCodes(prev => {
      if (prev.includes(fifaCode)) {
        return prev.filter(code => code !== fifaCode);
      }

      if (prev.length >= 8) return prev;

      return [...prev, fifaCode];
    });
  }

  const canGenerateBracket = selectedThirdPlaceCodes.length === 8;
  const canUseBracketButton = canGenerateBracket || tournamentChallengeLocked;

  return (
    <section
      className={`rounded-3xl shadow-2xl p-3 sm:p-5 ${
        darkMode ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Group Stage Predictor
          </h2>

          <p
            className={`text-sm sm:text-base ${
              darkMode ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Click teams in order from 1st to 4th. Once you select 3 teams, the
            remaining team automatically fills 4th place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          {onAutofillGroups && !tournamentChallengeLocked && (
            <button
              onClick={onAutofillGroups}
              className="rounded-full bg-purple-600 text-white px-5 py-3 sm:py-2 font-bold hover:bg-purple-700 transition"
            >
              Autofill Groups
            </button>
          )}

          <button
            onClick={onGenerateBracket}
            disabled={!canUseBracketButton}
            className={`rounded-full px-6 py-3 font-bold transition ${
              canUseBracketButton
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-500 text-white cursor-not-allowed"
            }`}
          >
            {topGenerateButtonLabel}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {groups.map(group => {
          const sourceTeams = getSourceTeams(group);
          const pickedTeams = getPickedTeams(group);

          return (
            <div
              key={group.id}
              className={`rounded-3xl border p-4 min-w-0 ${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-slate-100 border-slate-200"
              }`}
            >
              <div className="flex justify-between items-center gap-3 mb-5">
                <h3 className="text-3xl font-extrabold">{group.name}</h3>

                <button
                  onClick={() => clearGroup(group.id)}
                  disabled={tournamentChallengeLocked}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                    tournamentChallengeLocked
                      ? darkMode
                        ? "bg-slate-600 text-white opacity-40 cursor-not-allowed"
                        : "bg-slate-300 text-slate-500 opacity-40 cursor-not-allowed"
                      : darkMode
                      ? "bg-slate-600 text-white hover:bg-slate-500"
                      : "bg-slate-200 text-slate-700 border border-slate-300 hover:bg-slate-300"
                  }`}
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-6">
                {sourceTeams.map(team => {
                  const selected = pickedTeams.some(
                    picked => picked.fifaCode === team.fifaCode
                  );

                  return (
                    <button
                      key={team.fifaCode}
                      disabled={
                        tournamentChallengeLocked ||
                        selected ||
                        pickedTeams.length >= 4
                      }
                      onClick={() => selectTeam(group.id, team)}
                      className={`relative group rounded-2xl border px-1 py-3 sm:py-4 min-h-[82px] sm:min-h-[104px] flex flex-col items-center justify-center gap-1.5 sm:gap-2 transition ${
                        selected || tournamentChallengeLocked
                          ? darkMode
                            ? "bg-slate-900 border-slate-600 opacity-40 cursor-not-allowed"
                            : "bg-white border-slate-300 opacity-40 cursor-not-allowed"
                          : darkMode
                          ? "bg-slate-900 border-slate-600 hover:bg-slate-700"
                          : "bg-white border-slate-300 hover:bg-slate-50 hover:scale-[1.02]"
                      }`}
                    >
                      <span
                        className={`fi fi-${team.flagCode} rounded-sm text-2xl sm:text-3xl flex-shrink-0`}
                      />

                      <span className="text-sm sm:text-base font-extrabold">
                        {team.fifaCode}
                      </span>

                      <span className="pointer-events-none absolute -top-10 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-xs font-bold text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus:opacity-100">
                        {team.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                className={`rounded-[2rem] overflow-hidden ${
                  darkMode ? "bg-slate-950" : "bg-white"
                }`}
              >
                {[0, 1, 2, 3].map(index => {
                  const team = pickedTeams[index];

                  if (!team) {
                    return (
                      <div
                        key={`${group.id}-empty-${index}`}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(group.id, index)}
                        className={`border-b last:border-b-0 px-4 py-5 sm:py-6 ${
                          darkMode ? "border-slate-700" : "border-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-4 opacity-40">
                          <span className="text-3xl font-extrabold w-8">
                            {index + 1}
                          </span>

                          <span className="text-2xl font-bold">—</span>
                        </div>
                      </div>
                    );
                  }

                  const score = getPositionScore(group, team, index);

                  return (
                    <div
                      key={`${group.id}-${team.fifaCode}-${index}`}
                      draggable={!tournamentChallengeLocked}
                      onDragStart={() => handleDragStart(group.id, index)}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(group.id, index)}
                      className={`border-b last:border-b-0 px-4 py-5 sm:py-6 cursor-grab active:cursor-grabbing ${
                        darkMode ? "border-slate-700" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {score && (
                              <span
                                className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-extrabold ${
                                  score.correct
                                    ? "bg-green-600"
                                    : "bg-red-600"
                                }`}
                              >
                                {score.correct ? "✓" : "×"}
                              </span>
                            )}

                            <span className="text-3xl font-extrabold w-8">
                              {index + 1}
                            </span>
                          </div>

                          <span
                            className={`fi fi-${team.flagCode} rounded-sm text-2xl sm:text-3xl flex-shrink-0`}
                          />

                          <div className="min-w-0">
                            <div className="text-base sm:text-lg font-bold truncate">
                              {team.name}
                            </div>

                            {score && !score.correct && (
                              <div className="mt-1 flex items-center gap-1 text-[10px] text-red-300">
                                <span>Correct:</span>

                                {score.officialTeam && (
                                  <span
                                    className={`fi fi-${score.officialTeam.flagCode} rounded-sm flex-shrink-0`}
                                  />
                                )}

                                <span className="truncate">
                                  {score.officialTeam?.name ||
                                    score.officialCode}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <div className="flex sm:hidden flex-col gap-1">
                            <button
                              type="button"
                              disabled={tournamentChallengeLocked || index === 0}
                              onClick={() =>
                                moveTeamToPosition(group.id, index, index - 1)
                              }
                              className={`h-7 w-7 rounded-md text-xs font-extrabold ${
                                tournamentChallengeLocked || index === 0
                                  ? "bg-slate-600 text-slate-400 opacity-40 cursor-not-allowed"
                                  : darkMode
                                  ? "bg-slate-700 text-white"
                                  : "bg-slate-200 text-slate-800"
                              }`}
                              title="Move up"
                            >
                              ↑
                            </button>

                            <button
                              type="button"
                              disabled={
                                tournamentChallengeLocked ||
                                index === pickedTeams.length - 1
                              }
                              onClick={() =>
                                moveTeamToPosition(group.id, index, index + 1)
                              }
                              className={`h-7 w-7 rounded-md text-xs font-extrabold ${
                                tournamentChallengeLocked ||
                                index === pickedTeams.length - 1
                                  ? "bg-slate-600 text-slate-400 opacity-40 cursor-not-allowed"
                                  : darkMode
                                  ? "bg-slate-700 text-white"
                                  : "bg-slate-200 text-slate-800"
                              }`}
                              title="Move down"
                            >
                              ↓
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={tournamentChallengeLocked}
                            className={`hidden sm:block text-xl leading-none font-normal ${
                              darkMode
                                ? "text-slate-400 hover:text-white"
                                : "text-slate-500 hover:text-slate-700"
                            } ${
                              tournamentChallengeLocked
                                ? "opacity-30 cursor-not-allowed"
                                : "opacity-70 hover:opacity-100 cursor-grab"
                            }`}
                            title="Drag to reorder"
                          >
                            ☰
                          </button>
                        </div>
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
        className={`mt-8 rounded-3xl border p-4 sm:p-6 ${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-slate-50 border-slate-200"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-5">
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold">
              Select Advancing Third-Place Teams
            </h3>

            <p
              className={`text-sm sm:text-base ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Choose exactly 8 of 12 third-place teams.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {onAutofillThirdPlaceTeams && !tournamentChallengeLocked && (
              <button
                onClick={onAutofillThirdPlaceTeams}
                className="rounded-full bg-purple-600 text-white px-5 py-3 sm:py-2 font-bold hover:bg-purple-700 transition"
              >
                Autoselect Teams
              </button>
            )}

            <div
              className={`rounded-full px-5 py-3 sm:py-2 text-center font-extrabold ${
                tournamentChallengeMode && scoreResult
                  ? "bg-blue-600 text-white"
                  : selectedThirdPlaceCodes.length === 8
                  ? "bg-slate-600 text-white"
                  : "bg-yellow-400 text-slate-900"
              }`}
            >
              {tournamentChallengeMode && scoreResult
                ? `${
                    scoreResult.thirdPlaceBreakdown.filter(item => item.correct)
                      .length
                  }/8 correct`
                : `${selectedThirdPlaceCodes.length}/8 selected`}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {thirdPlaceTeams.map(team => {
            const selected = selectedThirdPlaceCodes.includes(team.fifaCode);

            const thirdScore =
              tournamentChallengeMode && scoreResult?.thirdPlaceBreakdown
                ? scoreResult.thirdPlaceBreakdown.find(
                    item => item.picked === team.fifaCode
                  )
                : null;

            const showThirdScore =
              tournamentChallengeMode && scoreResult && selected && thirdScore;

            return (
              <button
                key={`${team.groupName}-${team.fifaCode}`}
                onClick={() => toggleThirdPlaceTeam(team.fifaCode)}
                disabled={tournamentChallengeLocked}
                className={`rounded-2xl border px-4 py-4 text-left flex items-center justify-between ${
                  tournamentChallengeLocked ? "cursor-not-allowed" : ""
                } ${
                  selected
                    ? showThirdScore
                      ? thirdScore.correct
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-red-600 text-white border-red-600"
                      : "bg-green-600 text-white border-green-600"
                    : darkMode
                    ? "bg-slate-900 border-slate-600 text-white"
                    : "bg-white border-slate-300 text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`fi fi-${team.flagCode} rounded-sm text-2xl flex-shrink-0`}
                  />

                  <div className="min-w-0">
                    <div className="font-extrabold truncate">{team.name}</div>

                    <div className="text-sm opacity-80">
                      {team.groupName} 3rd place
                    </div>

                    {showThirdScore && (
                      <div className="mt-1 text-xs font-bold opacity-90">
                        {thirdScore.correct
                          ? `Correct +${thirdScore.points} pts`
                          : "Incorrect third-place pick"}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center text-white font-extrabold flex-shrink-0 ${
                    showThirdScore
                      ? thirdScore.correct
                        ? "bg-green-800"
                        : "bg-red-800"
                      : selected
                      ? "bg-green-800"
                      : "bg-slate-600"
                  }`}
                >
                  {showThirdScore
                    ? thirdScore.correct
                      ? "✓"
                      : "×"
                    : selected
                    ? "✓"
                    : "+"}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setSelectedThirdPlaceCodes([])}
            disabled={tournamentChallengeLocked}
            className={`rounded-full px-8 py-4 text-lg font-bold ${
              tournamentChallengeLocked
                ? "bg-gray-500 text-white opacity-50 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
          >
            Clear Third Places
          </button>

          <button
            onClick={onGenerateBracket}
            disabled={!canUseBracketButton}
            className={`rounded-full px-8 py-4 text-lg font-bold ${
              canUseBracketButton
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-500 text-white cursor-not-allowed"
            }`}
          >
            {bottomGenerateButtonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}