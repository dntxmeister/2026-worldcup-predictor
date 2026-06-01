export const initialGroups = [
    {
      id: "A",
      name: "Group A",
      teams: [
        { name: "Mexico", fifaCode: "MEX", flagCode: "mx" },
        { name: "South Africa", fifaCode: "RSA", flagCode: "za" },
        { name: "South Korea", fifaCode: "KOR", flagCode: "kr" },
        { name: "Czechia", fifaCode: "CZE", flagCode: "cz" }
      ]
    },
    {
      id: "B",
      name: "Group B",
      teams: [
        { name: "Canada", fifaCode: "CAN", flagCode: "ca" },
        { name: "Bosnia and Herzegovina", fifaCode: "BIH", flagCode: "ba" },
        { name: "Qatar", fifaCode: "QAT", flagCode: "qa" },
        { name: "Switzerland", fifaCode: "SUI", flagCode: "ch" }
      ]
    },
    {
      id: "C",
      name: "Group C",
      teams: [
        { name: "Brazil", fifaCode: "BRA", flagCode: "br" },
        { name: "Morocco", fifaCode: "MAR", flagCode: "ma" },
        { name: "Haiti", fifaCode: "HAI", flagCode: "ht" },
        { name: "Scotland", fifaCode: "SCO", flagCode: "gb-sct" }
      ]
    },
    {
      id: "D",
      name: "Group D",
      teams: [
        { name: "USA", fifaCode: "USA", flagCode: "us" },
        { name: "Paraguay", fifaCode: "PAR", flagCode: "py" },
        { name: "Australia", fifaCode: "AUS", flagCode: "au" },
        { name: "Türkiye", fifaCode: "TUR", flagCode: "tr" }
      ]
    },
    {
      id: "E",
      name: "Group E",
      teams: [
        { name: "Germany", fifaCode: "GER", flagCode: "de" },
        { name: "Curaçao", fifaCode: "CUW", flagCode: "cw" },
        { name: "Ivory Coast", fifaCode: "CIV", flagCode: "ci" },
        { name: "Ecuador", fifaCode: "ECU", flagCode: "ec" }
      ]
    },
    {
      id: "F",
      name: "Group F",
      teams: [
        { name: "Netherlands", fifaCode: "NED", flagCode: "nl" },
        { name: "Japan", fifaCode: "JPN", flagCode: "jp" },
        { name: "Sweden", fifaCode: "SWE", flagCode: "se" },
        { name: "Tunisia", fifaCode: "TUN", flagCode: "tn" }
      ]
    },
    {
      id: "G",
      name: "Group G",
      teams: [
        { name: "Belgium", fifaCode: "BEL", flagCode: "be" },
        { name: "Egypt", fifaCode: "EGY", flagCode: "eg" },
        { name: "Iran", fifaCode: "IRN", flagCode: "ir" },
        { name: "New Zealand", fifaCode: "NZL", flagCode: "nz" }
      ]
    },
    {
      id: "H",
      name: "Group H",
      teams: [
        { name: "Spain", fifaCode: "ESP", flagCode: "es" },
        { name: "Cape Verde", fifaCode: "CPV", flagCode: "cv" },
        { name: "Saudi Arabia", fifaCode: "KSA", flagCode: "sa" },
        { name: "Uruguay", fifaCode: "URU", flagCode: "uy" }
      ]
    },
    {
        id: "I",
        name: "Group I",
        teams: [
          { name: "France", fifaCode: "FRA", flagCode: "fr" },
          { name: "Senegal", fifaCode: "SEN", flagCode: "sn" },
          { name: "Iraq", fifaCode: "IRQ", flagCode: "iq" },
          { name: "Norway", fifaCode: "NOR", flagCode: "no" }
        ]
      },
      {
        id: "J",
        name: "Group J",
        teams: [
          { name: "Argentina", fifaCode: "ARG", flagCode: "ar" },
          { name: "Algeria", fifaCode: "ALG", flagCode: "dz" },
          { name: "Austria", fifaCode: "AUT", flagCode: "at" },
          { name: "Jordan", fifaCode: "JOR", flagCode: "jo" }
        ]
      },
      {
        id: "K",
        name: "Group K",
        teams: [
          { name: "Portugal", fifaCode: "POR", flagCode: "pt" },
          { name: "DR Congo", fifaCode: "COD", flagCode: "cd" },
          { name: "Uzbekistan", fifaCode: "UZB", flagCode: "uz" },
          { name: "Colombia", fifaCode: "COL", flagCode: "co" }
        ]
      },
      {
        id: "L",
        name: "Group L",
        teams: [
          { name: "England", fifaCode: "ENG", flagCode: "gb-eng" },
          { name: "Croatia", fifaCode: "CRO", flagCode: "hr" },
          { name: "Ghana", fifaCode: "GHA", flagCode: "gh" },
          { name: "Panama", fifaCode: "PAN", flagCode: "pa" }
        ]
      }
  ];
  
  export const initialChallengeGroups = structuredClone(initialGroups);