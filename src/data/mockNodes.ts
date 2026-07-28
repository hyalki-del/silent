export interface NodeData {
  id: string;
  codename: string;
  tier: 1 | 2;
  distanceKm: number;
  compatibilityScore: number;
  output: string;
  techStack: string[];
}

export const MY_NODE: NodeData = {
  id: "self-node",
  codename: "Sen / Merkez Node",
  tier: 1,
  distanceKm: 0,
  compatibilityScore: 100,
  output: "Sistem mimarisi, sıfır gürültü protokolleri ve rasyonel insan eşleme ağı kurucusu.",
  techStack: ["Architecture", "Next.js", "Systems Design", "Protocol Logic"],
};

export const MOCK_NODES: NodeData[] = [
  {
    id: "node-01",
    codename: "Akel / Görükle",
    tier: 1,
    distanceKm: 4,
    compatibilityScore: 92,
    output: "Rust tabanlı mikro-servis mimarisi ve lojistik optimizasyon motoru.",
    techStack: ["Rust", "Docker", "Systems Architecture"],
  },
  {
    id: "node-02",
    codename: "Defne / İstanbul",
    tier: 2,
    distanceKm: 125,
    compatibilityScore: 86,
    output: "Generative Design, 3D parametric modeling ve donanım prototipleme.",
    techStack: ["Rhino/Grasshopper", "Python", "Hardware"],
  },
  {
    id: "node-03",
    codename: "Kaan / Nilüfer",
    tier: 1,
    distanceKm: 12,
    compatibilityScore: 78,
    output: "Modüler synthesizer tasarımı ve açık kaynak analog devreler.",
    techStack: ["C++", "PCB Design", "Analog Audio"],
  }
];
