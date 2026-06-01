// client/src/logic/challengeScoring.js

const POINTS = {
    ADVANCING_TEAM: 7,
    EXACT_POSITION: 3,
    GROUP_WINNER: 5,
    EXACT_POINTS: 3,
    WITHIN_ONE_POINT: 1,
    THIRD_PLACE_ADVANCER: 5
  };
  
  export function scoreGroupChallenge(
    userGroups,
    officialGroupResults,
    selectedThirdPlaceCodes = [],
    officialThirdPlaceAdvancers = []
  ) {
    let totalPoints = 0;
    const breakdown = [];
    const thirdPlaceBreakdown = [];
  
    userGroups.forEach(group => {
      const groupLetter = group.name.replace("Group ", "").trim();
      const officialGroup = officialGroupResults[groupLetter];
  
      if (!officialGroup) return;
  
      const officialOrder = officialGroup.standings.map(team => team.fifaCode);
      const officialAdvancers = new Set(officialOrder.slice(0, 2));
  
      group.teams.forEach((team, index) => {
        const officialTeamAtPosition = officialGroup.standings[index];
        const officialTeam = officialGroup.standings.find(
          item => item.fifaCode === team.fifaCode
        );
  
        let rowPoints = 0;
        const details = [];
  
        if (index < 2 && officialAdvancers.has(team.fifaCode)) {
          rowPoints += POINTS.ADVANCING_TEAM;
          details.push(`+${POINTS.ADVANCING_TEAM} advanced top 2`);
        }
  
        if (officialTeamAtPosition?.fifaCode === team.fifaCode) {
          rowPoints += POINTS.EXACT_POSITION;
          details.push(`+${POINTS.EXACT_POSITION} exact position`);
        }
  
        if (index === 0 && officialOrder[0] === team.fifaCode) {
          rowPoints += POINTS.GROUP_WINNER;
          details.push(`+${POINTS.GROUP_WINNER} group winner`);
        }
  
        if (
          typeof team.predictedPoints === "number" &&
          typeof officialTeam?.points === "number"
        ) {
          const diff = Math.abs(team.predictedPoints - officialTeam.points);
  
          if (diff === 0) {
            rowPoints += POINTS.EXACT_POINTS;
            details.push(`+${POINTS.EXACT_POINTS} exact points`);
          } else if (diff === 1) {
            rowPoints += POINTS.WITHIN_ONE_POINT;
            details.push(`+${POINTS.WITHIN_ONE_POINT} within 1 point`);
          }
        }
  
        totalPoints += rowPoints;
  
        breakdown.push({
          group: groupLetter,
          position: index + 1,
          picked: team.fifaCode,
          official: officialTeamAtPosition?.fifaCode,
          correct: officialTeamAtPosition?.fifaCode === team.fifaCode,
          advancedCorrectly:
            index < 2 && officialAdvancers.has(team.fifaCode),
          points: rowPoints,
          details
        });
      });
    });
  
    const officialThirds = new Set(officialThirdPlaceAdvancers);
  
    selectedThirdPlaceCodes.forEach(code => {
      const correct = officialThirds.has(code);
      const points = correct ? POINTS.THIRD_PLACE_ADVANCER : 0;
  
      totalPoints += points;
  
      thirdPlaceBreakdown.push({
        picked: code,
        correct,
        points,
        details: correct
          ? [`+${POINTS.THIRD_PLACE_ADVANCER} third-place advancer`]
          : []
      });
    });
  
    return {
      totalPoints,
      breakdown,
      thirdPlaceBreakdown,
      scoringRules: POINTS
    };
  }