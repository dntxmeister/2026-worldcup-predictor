export function flattenTeams(groups) {
    return groups.flatMap(group => group.teams);
  }
  
  export function getThirdPlaceTeams(groups) {
    return groups.map(group => ({
      ...group.teams[2],
      groupId: group.id,
      groupName: group.name,
      groupLetter: group.name.replace("Group ", "").trim()
    }));
  }
  
  export function getQualifiedTeamsFromGroupOrders(groups, selectedThirdPlaceCodes) {
    const automaticQualifiers = [];
  
    groups.forEach(group => {
      automaticQualifiers.push(group.teams[0], group.teams[1]);
    });
  
    const selectedThirds = getThirdPlaceTeams(groups).filter(team =>
      selectedThirdPlaceCodes.includes(team.fifaCode)
    );
  
    return [...automaticQualifiers, ...selectedThirds];
  }
  
  function placeholderTeam(label) {
    return {
      name: label,
      fifaCode: label,
      flagCode: null,
      isPlaceholder: true
    };
  }
  
  export function getOfficialBracketFromGroups(groups, selectedThirdPlaceCodes) {
    const groupMap = {};
  
    groups.forEach(group => {
      const letter = group.name.replace("Group ", "").trim();
  
      groupMap[letter] = {
        first: group.teams[0],
        second: group.teams[1],
        third: {
          ...group.teams[2],
          groupLetter: letter,
          groupName: group.name
        }
      };
    });
  
    const selectedThirds = Object.values(groupMap)
      .map(group => group.third)
      .filter(team => selectedThirdPlaceCodes.includes(team.fifaCode));
  
    function resolveFixedSeed(seed) {
      if (seed.startsWith("1")) {
        return groupMap[seed[1]]?.first || placeholderTeam(seed);
      }
  
      if (seed.startsWith("2")) {
        return groupMap[seed[1]]?.second || placeholderTeam(seed);
      }
  
      return placeholderTeam(seed);
    }
  
    const officialBracketVisualOrder = [
      ["R32-74", "1E", "3ABCDF"],
      ["R32-77", "1I", "3CDFGH"],
      ["R32-73", "2A", "2B"],
      ["R32-75", "1F", "2C"],
  
      ["R32-83", "2K", "2L"],
      ["R32-84", "1H", "2J"],
      ["R32-81", "1D", "3BEFIJ"],
      ["R32-82", "1G", "3AEHIJ"],
  
      ["R32-76", "1C", "2F"],
      ["R32-78", "2E", "2I"],
      ["R32-79", "1A", "3CEFHI"],
      ["R32-80", "1L", "3EHIJK"],
  
      ["R32-86", "1J", "2H"],
      ["R32-88", "2D", "2G"],
      ["R32-85", "1B", "3EFGIJ"],
      ["R32-87", "1K", "3DEIJL"]
    ];
  
    const thirdSeedSlots = officialBracketVisualOrder
      .map(([, seedA, seedB], index) => {
        const thirdSeed = seedA.startsWith("3") ? seedA : seedB;
        const opponentSeed = seedA.startsWith("3") ? seedB : seedA;
  
        if (!thirdSeed.startsWith("3")) return null;
  
        return {
          index,
          thirdSeed,
          opponentSeed,
          opponentGroup: opponentSeed[1],
          allowedGroups: thirdSeed.replace("3", "").split("")
        };
      })
      .filter(Boolean);
  
    const thirdAssignments = {};
  
    function backtrack(slotIndex, remainingTeams) {
      if (slotIndex === thirdSeedSlots.length) {
        return true;
      }
  
      const slot = thirdSeedSlots[slotIndex];
  
      const candidates = remainingTeams.filter(team => {
        const allowed = slot.allowedGroups.includes(team.groupLetter);
        const notSameGroup = team.groupLetter !== slot.opponentGroup;
  
        return allowed && notSameGroup;
      });
  
      candidates.sort((a, b) => {
        const aOptions = thirdSeedSlots
          .slice(slotIndex + 1)
          .filter(
            nextSlot =>
              nextSlot.allowedGroups.includes(a.groupLetter) &&
              a.groupLetter !== nextSlot.opponentGroup
          ).length;
  
        const bOptions = thirdSeedSlots
          .slice(slotIndex + 1)
          .filter(
            nextSlot =>
              nextSlot.allowedGroups.includes(b.groupLetter) &&
              b.groupLetter !== nextSlot.opponentGroup
          ).length;
  
        return aOptions - bOptions;
      });
  
      for (const team of candidates) {
        thirdAssignments[slot.index] = team;
  
        const nextRemaining = remainingTeams.filter(
          t => t.fifaCode !== team.fifaCode
        );
  
        if (backtrack(slotIndex + 1, nextRemaining)) {
          return true;
        }
  
        delete thirdAssignments[slot.index];
      }
  
      return false;
    }
  
    backtrack(0, selectedThirds);
  
    return officialBracketVisualOrder.map(([id, seedA, seedB], index) => {
      const teamA = seedA.startsWith("3")
        ? thirdAssignments[index] || placeholderTeam(seedA)
        : resolveFixedSeed(seedA);
  
      const teamB = seedB.startsWith("3")
        ? thirdAssignments[index] || placeholderTeam(seedB)
        : resolveFixedSeed(seedB);
  
      return {
        id,
        seedA,
        seedB,
        teamA,
        teamB
      };
    });
  }
  
  export function generateInitialBracket(input) {
    const isOfficialMatchups =
      Array.isArray(input) &&
      input.length > 0 &&
      input[0]?.teamA &&
      input[0]?.teamB;
  
    const makeMatch = (id, teamA, teamB, date, city) => ({
      id,
      teamA,
      teamB,
      winner: null,
      loser: null,
      scoreA: "",
      scoreB: "",
      date,
      city
    });
  
    const roundOf32Schedule = [
      ["Jun 29", "Boston"],
      ["Jun 30", "New York"],
      ["Jun 28", "Los Angeles"],
      ["Jun 29", "Monterrey"],
  
      ["Jul 2", "Toronto"],
      ["Jul 2", "Los Angeles"],
      ["Jul 1", "San Francisco"],
      ["Jul 1", "Seattle"],
  
      ["Jun 29", "Houston"],
      ["Jun 30", "Dallas"],
      ["Jun 30", "Mexico City"],
      ["Jul 1", "Atlanta"],
  
      ["Jul 3", "Miami"],
      ["Jul 3", "Dallas"],
      ["Jul 2", "Vancouver"],
      ["Jul 3", "Kansas City"]
    ];
  
    let roundOf32 = [];
  
    if (isOfficialMatchups) {
      roundOf32 = input.map((matchup, index) => {
        const [date, city] = roundOf32Schedule[index] || ["TBD", "TBD"];
  
        return makeMatch(
          matchup.id || `R32-${index + 1}`,
          matchup.teamA,
          matchup.teamB,
          date,
          city
        );
      });
    } else {
      const first32 = [...input].slice(0, 32);
  
      while (first32.length < 32) {
        first32.push(placeholderTeam(`TBD ${first32.length + 1}`));
      }
  
      for (let i = 0; i < 32; i += 2) {
        const [date, city] = roundOf32Schedule[i / 2] || ["TBD", "TBD"];
  
        roundOf32.push(
          makeMatch(
            `R32-${i / 2 + 1}`,
            first32[i],
            first32[i + 1],
            date,
            city
          )
        );
      }
    }
  
    const roundOf16Schedule = [
      ["R16-89", "Winner R32-74", "Winner R32-77", "Jul 4", "Philadelphia"],
      ["R16-90", "Winner R32-73", "Winner R32-75", "Jul 4", "Houston"],
  
      ["R16-93", "Winner R32-83", "Winner R32-84", "Jul 6", "Dallas"],
      ["R16-94", "Winner R32-81", "Winner R32-82", "Jul 6", "Seattle"],
  
      ["R16-91", "Winner R32-76", "Winner R32-78", "Jul 5", "New York"],
      ["R16-92", "Winner R32-79", "Winner R32-80", "Jul 5", "Mexico City"],
  
      ["R16-95", "Winner R32-86", "Winner R32-88", "Jul 7", "Atlanta"],
      ["R16-96", "Winner R32-85", "Winner R32-87", "Jul 7", "Vancouver"]
    ];
  
    const quarterFinalSchedule = [
      ["QF-97", "Winner R16-89", "Winner R16-90", "Jul 9", "Boston"],
      ["QF-98", "Winner R16-93", "Winner R16-94", "Jul 10", "Los Angeles"],
      ["QF-99", "Winner R16-91", "Winner R16-92", "Jul 11", "Miami"],
      ["QF-100", "Winner R16-95", "Winner R16-96", "Jul 11", "Kansas City"]
    ];
  
    const semiFinalSchedule = [
      ["SF-101", "Winner QF-97", "Winner QF-98", "Jul 14", "Dallas"],
      ["SF-102", "Winner QF-99", "Winner QF-100", "Jul 15", "Atlanta"]
    ];
  
    return {
      roundOf32,
  
      roundOf16: roundOf16Schedule.map(([id, teamA, teamB, date, city]) =>
        makeMatch(
          id,
          placeholderTeam(teamA),
          placeholderTeam(teamB),
          date,
          city
        )
      ),
  
      quarterFinals: quarterFinalSchedule.map(([id, teamA, teamB, date, city]) =>
        makeMatch(
          id,
          placeholderTeam(teamA),
          placeholderTeam(teamB),
          date,
          city
        )
      ),
  
      semiFinals: semiFinalSchedule.map(([id, teamA, teamB, date, city]) =>
        makeMatch(
          id,
          placeholderTeam(teamA),
          placeholderTeam(teamB),
          date,
          city
        )
      ),
  
      final: [
        makeMatch(
          "FINAL-104",
          placeholderTeam("Winner SF-101"),
          placeholderTeam("Winner SF-102"),
          "Jul 19",
          "New York"
        )
      ],
  
      thirdPlace: [
        makeMatch(
          "THIRD-103",
          placeholderTeam("Loser SF-101"),
          placeholderTeam("Loser SF-102"),
          "Jul 18",
          "Miami"
        )
      ],
  
      champion: null,
      thirdPlaceWinner: null
    };
  }
  
  export function advanceWinner(bracket, roundName, matchIndex, winner) {
    if (!winner || winner.isPlaceholder) return bracket;
  
    const updated = structuredClone(bracket);
    const match = updated[roundName][matchIndex];
  
    const loser =
      match.teamA?.fifaCode === winner.fifaCode ? match.teamB : match.teamA;
  
    match.winner = winner;
    match.loser = loser;
  
    if (roundName === "thirdPlace") {
      updated.thirdPlaceWinner = winner;
      return updated;
    }
  
    if (roundName === "final") {
      updated.champion = winner;
      return updated;
    }
  
    if (roundName === "semiFinals") {
      if (matchIndex === 0) {
        updated.thirdPlace[0].teamA = loser;
      } else {
        updated.thirdPlace[0].teamB = loser;
      }
    }
  
    const nextMap = {
      roundOf32: "roundOf16",
      roundOf16: "quarterFinals",
      quarterFinals: "semiFinals",
      semiFinals: "final"
    };
  
    const nextRoundName = nextMap[roundName];
    if (!nextRoundName) return updated;
  
    const nextMatchIndex = Math.floor(matchIndex / 2);
  
    if (matchIndex % 2 === 0) {
      updated[nextRoundName][nextMatchIndex].teamA = winner;
    } else {
      updated[nextRoundName][nextMatchIndex].teamB = winner;
    }
  
    updated[nextRoundName][nextMatchIndex].winner = null;
    updated[nextRoundName][nextMatchIndex].scoreA = "";
    updated[nextRoundName][nextMatchIndex].scoreB = "";
  
    return updated;
  }