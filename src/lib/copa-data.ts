export interface Team {
  name: string;
  code: string;
  flag: string; // emoji
  group: string;
  fifaRank?: number;
}

// 48 seleções organizadas por grupo (placeholder oficial — Copa 2026)
export const TEAMS: Team[] = [
  { name: "Canadá", code: "CAN", flag: "🇨🇦", group: "A", fifaRank: 31 },
  { name: "México", code: "MEX", flag: "🇲🇽", group: "A", fifaRank: 15 },
  { name: "Marrocos", code: "MAR", flag: "🇲🇦", group: "A", fifaRank: 14 },
  { name: "Croácia", code: "CRO", flag: "🇭🇷", group: "A", fifaRank: 9 },

  { name: "Estados Unidos", code: "USA", flag: "🇺🇸", group: "B", fifaRank: 16 },
  { name: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", group: "B", fifaRank: 4 },
  { name: "Senegal", code: "SEN", flag: "🇸🇳", group: "B", fifaRank: 18 },
  { name: "Equador", code: "ECU", flag: "🇪🇨", group: "B", fifaRank: 24 },

  { name: "Argentina", code: "ARG", flag: "🇦🇷", group: "C", fifaRank: 1 },
  { name: "Bélgica", code: "BEL", flag: "🇧🇪", group: "C", fifaRank: 6 },
  { name: "Egito", code: "EGY", flag: "🇪🇬", group: "C", fifaRank: 37 },
  { name: "Austrália", code: "AUS", flag: "🇦🇺", group: "C", fifaRank: 26 },

  { name: "França", code: "FRA", flag: "🇫🇷", group: "D", fifaRank: 2 },
  { name: "Holanda", code: "NED", flag: "🇳🇱", group: "D", fifaRank: 7 },
  { name: "Japão", code: "JPN", flag: "🇯🇵", group: "D", fifaRank: 19 },
  { name: "Costa do Marfim", code: "CIV", flag: "🇨🇮", group: "D", fifaRank: 41 },

  { name: "Brasil", code: "BRA", flag: "🇧🇷", group: "E", fifaRank: 5 },
  { name: "Espanha", code: "ESP", flag: "🇪🇸", group: "E", fifaRank: 8 },
  { name: "Coreia do Sul", code: "KOR", flag: "🇰🇷", group: "E", fifaRank: 23 },
  { name: "Nova Zelândia", code: "NZL", flag: "🇳🇿", group: "E", fifaRank: 89 },

  { name: "Portugal", code: "POR", flag: "🇵🇹", group: "F", fifaRank: 3 },
  { name: "Alemanha", code: "GER", flag: "🇩🇪", group: "F", fifaRank: 10 },
  { name: "Nigéria", code: "NGA", flag: "🇳🇬", group: "F", fifaRank: 39 },
  { name: "Catar", code: "QAT", flag: "🇶🇦", group: "F", fifaRank: 55 },

  { name: "Itália", code: "ITA", flag: "🇮🇹", group: "G", fifaRank: 11 },
  { name: "Uruguai", code: "URU", flag: "🇺🇾", group: "G", fifaRank: 12 },
  { name: "Camarões", code: "CMR", flag: "🇨🇲", group: "G", fifaRank: 42 },
  { name: "Panamá", code: "PAN", flag: "🇵🇦", group: "G", fifaRank: 35 },

  { name: "Colômbia", code: "COL", flag: "🇨🇴", group: "H", fifaRank: 13 },
  { name: "Suíça", code: "SUI", flag: "🇨🇭", group: "H", fifaRank: 17 },
  { name: "Tunísia", code: "TUN", flag: "🇹🇳", group: "H", fifaRank: 47 },
  { name: "Honduras", code: "HON", flag: "🇭🇳", group: "H", fifaRank: 78 },

  { name: "Dinamarca", code: "DEN", flag: "🇩🇰", group: "I", fifaRank: 20 },
  { name: "Áustria", code: "AUT", flag: "🇦🇹", group: "I", fifaRank: 22 },
  { name: "Mali", code: "MLI", flag: "🇲🇱", group: "I", fifaRank: 52 },
  { name: "Jamaica", code: "JAM", flag: "🇯🇲", group: "I", fifaRank: 60 },

  { name: "Suécia", code: "SWE", flag: "🇸🇪", group: "J", fifaRank: 25 },
  { name: "País de Gales", code: "WAL", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", group: "J", fifaRank: 30 },
  { name: "Argélia", code: "ALG", flag: "🇩🇿", group: "J", fifaRank: 36 },
  { name: "Costa Rica", code: "CRC", flag: "🇨🇷", group: "J", fifaRank: 54 },

  { name: "Polônia", code: "POL", flag: "🇵🇱", group: "K", fifaRank: 28 },
  { name: "Sérvia", code: "SRB", flag: "🇷🇸", group: "K", fifaRank: 29 },
  { name: "África do Sul", code: "RSA", flag: "🇿🇦", group: "K", fifaRank: 58 },
  { name: "Arábia Saudita", code: "KSA", flag: "🇸🇦", group: "K", fifaRank: 56 },

  { name: "Turquia", code: "TUR", flag: "🇹🇷", group: "L", fifaRank: 33 },
  { name: "Hungria", code: "HUN", flag: "🇭🇺", group: "L", fifaRank: 34 },
  { name: "Cabo Verde", code: "CPV", flag: "🇨🇻", group: "L", fifaRank: 75 },
  { name: "Iraque", code: "IRQ", flag: "🇮🇶", group: "L", fifaRank: 58 },
];

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export interface Stadium {
  name: string;
  city: string;
  country: "USA" | "MEX" | "CAN";
  capacity: number;
  highlight?: string;
}

export const STADIUMS: Stadium[] = [
  { name: "MetLife Stadium", city: "Nova York / Nova Jersey", country: "USA", capacity: 82500, highlight: "Final" },
  { name: "AT&T Stadium", city: "Dallas", country: "USA", capacity: 80000 },
  { name: "SoFi Stadium", city: "Los Angeles", country: "USA", capacity: 70000 },
  { name: "Estádio Azteca", city: "Cidade do México", country: "MEX", capacity: 87000, highlight: "Abertura" },
  { name: "Hard Rock Stadium", city: "Miami", country: "USA", capacity: 65000 },
  { name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", capacity: 71000 },
  { name: "Arrowhead Stadium", city: "Kansas City", country: "USA", capacity: 76000 },
  { name: "NRG Stadium", city: "Houston", country: "USA", capacity: 72000 },
  { name: "Gillette Stadium", city: "Boston", country: "USA", capacity: 65000 },
  { name: "Lincoln Financial Field", city: "Philadelphia", country: "USA", capacity: 69000 },
  { name: "Levi's Stadium", city: "São Francisco", country: "USA", capacity: 68500 },
  { name: "Lumen Field", city: "Seattle", country: "USA", capacity: 68740 },
  { name: "BC Place", city: "Vancouver", country: "CAN", capacity: 54500 },
  { name: "BMO Field", city: "Toronto", country: "CAN", capacity: 45500 },
  { name: "Estadio BBVA", city: "Monterrey", country: "MEX", capacity: 53500 },
  { name: "Estadio Akron", city: "Guadalajara", country: "MEX", capacity: 49850 },
];

export const teamsByGroup = (g: string) => TEAMS.filter((t) => t.group === g);
