export function scoreGroupPrediction(userGroups, officialGroups) {
    let points = 0;
  
    userGroups.forEach(userGroup => {
      const officialGroup = officialGroups.find(g => g.id === userGroup.id);
      if (!officialGroup) return;
  
      userGroup.teams.forEach((team, index) => {
        if (team.fifaCode === officialGroup.teams[index]?.fifaCode) {
          points += 3;
        }
      });
    });
  
    return points;
  }
  
  export function scoreBracketPrediction(userBracket, officialBracket) {
    let points = 0;
  
    const rounds = [
      "roundOf32",
      "roundOf16",
      "quarterFinals",
      "semiFinals",
      "final"
    ];
  
    rounds.forEach(round => {
      userBracket[round]?.forEach((userMatch, index) => {
        const officialMatch = officialBracket[round]?.[index];
        if (!officialMatch) return;
  
        const userTeams = [
          userMatch.teamA?.fifaCode,
          userMatch.teamB?.fifaCode
        ].filter(Boolean);
  
        const officialTeams = [
          officialMatch.teamA?.fifaCode,
          officialMatch.teamB?.fifaCode
        ].filter(Boolean);
  
        const correctTeams = userTeams.filter(code =>
          officialTeams.includes(code)
        ).length;
  
        if (correctTeams === 2) points += 10;
        else if (correctTeams === 1) points += 5;
  
        if (
          userMatch.winner?.fifaCode &&
          userMatch.winner?.fifaCode === officialMatch.winner?.fifaCode
        ) {
          points += getWinnerPoints(round);
        }
      });
    });
  
    return points;
  }
  
  function getWinnerPoints(round) {
    const map = {
      roundOf32: 4,
      roundOf16: 6,
      quarterFinals: 8,
      semiFinals: 12,
      final: 20
    };
  
    return map[round] || 0;
  }
  
  export function getTotalTournamentScore({
    userGroups,
    officialGroups,
    userBracket,
    officialBracket
  }) {
    return (
      scoreGroupPrediction(userGroups, officialGroups) +
      scoreBracketPrediction(userBracket, officialBracket)
    );
  }