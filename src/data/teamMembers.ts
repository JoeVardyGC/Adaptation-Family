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

export function resolveTeamMemberImage(name?: string, currentImage?: string): string {
  // If the current image is already a working local path or data URL and NOT broken Cloudinary or Unsplash
  if (
    currentImage &&
    typeof currentImage === "string" &&
    !currentImage.includes("cloudinary.com") &&
    !currentImage.includes("unsplash.com") &&
    !currentImage.includes("photo-1534528741775")
  ) {
    return currentImage;
  }

  const lower = (name || "").toLowerCase().trim();
  if (lower.includes("adaptation")) return "/images/team/Adaptation.jpeg";
  if (lower.includes("zygote")) return "/images/team/ZYGOTE.jpeg";
  if (lower.includes("dagarma")) return "/images/team/Dagarma.jpeg";
  if (lower.includes("nana") || lower.includes("wiafe")) return "/images/team/Nana Wiafe.jpeg";
  if (lower.includes("kofi") || lower.includes("abrante")) return "/images/team/Kofi Abrante3.jpeg";
  if (lower.includes("mr") || lower.includes("p")) return "/images/team/Mr.p.jpeg";
  if (lower.includes("bushman")) return "/images/team/bushman.jpeg";

  return "/images/team/Adaptation.jpeg";
}
