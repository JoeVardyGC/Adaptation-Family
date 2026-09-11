export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  img?: string;
  isFeatured?: boolean;
}

export const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: "team-adaptation",
    name: "Adaptation",
    role: "Leader",
    image: "/images/team/Adaptation.jpeg",
    img: "/images/team/Adaptation.jpeg",
    isFeatured: true
  },
  {
    id: "team-dagarma",
    name: "Dagarma",
    role: "Member",
    image: "/images/team/Dagarma.jpeg",
    img: "/images/team/Dagarma.jpeg"
  },
  {
    id: "team-kofi-abrante3",
    name: "Kofi Abrante3",
    role: "Member",
    image: "/images/team/Kofi Abrante3.jpeg",
    img: "/images/team/Kofi Abrante3.jpeg"
  },
  {
    id: "team-mr-p",
    name: "Mr.p",
    role: "Member",
    image: "/images/team/Mr.p.jpeg",
    img: "/images/team/Mr.p.jpeg"
  },
  {
    id: "team-nana-wiafe",
    name: "Nana Wiafe",
    role: "Member",
    image: "/images/team/Nana Wiafe.jpeg",
    img: "/images/team/Nana Wiafe.jpeg"
  },
  {
    id: "team-zygote",
    name: "ZYGOTE",
    role: "Member",
    image: "/images/team/ZYGOTE.jpeg",
    img: "/images/team/ZYGOTE.jpeg"
  },
  {
    id: "team-bushman",
    name: "bushman",
    role: "Member",
    image: "/images/team/bushman.jpeg",
    img: "/images/team/bushman.jpeg"
  }
];
