import {
  Baby,
  Briefcase,
  Building2,
  Calculator,
  Camera,
  Car,
  Dumbbell,
  Factory,
  GraduationCap,
  HardHat,
  House,
  Laptop,
  Megaphone,
  PartyPopper,
  PawPrint,
  Scale,
  Scissors,
  Shield,
  Shirt,
  Sparkles,
  Sprout,
  Stethoscope,
  Truck,
  UtensilsCrossed,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react"

/** The icons admins can give a category. Keys are stored on the category (`icon`). */
export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  house: { icon: House, label: "House" },
  "party-popper": { icon: PartyPopper, label: "Party" },
  truck: { icon: Truck, label: "Truck" },
  scissors: { icon: Scissors, label: "Scissors" },
  laptop: { icon: Laptop, label: "Laptop" },
  car: { icon: Car, label: "Car" },
  "graduation-cap": { icon: GraduationCap, label: "Graduation cap" },
  stethoscope: { icon: Stethoscope, label: "Stethoscope" },
  "hard-hat": { icon: HardHat, label: "Hard hat" },
  shirt: { icon: Shirt, label: "Shirt" },
  sprout: { icon: Sprout, label: "Sprout" },
  "utensils-crossed": { icon: UtensilsCrossed, label: "Cutlery" },
  shield: { icon: Shield, label: "Shield" },
  baby: { icon: Baby, label: "Baby" },
  camera: { icon: Camera, label: "Camera" },
  calculator: { icon: Calculator, label: "Calculator" },
  megaphone: { icon: Megaphone, label: "Megaphone" },
  wrench: { icon: Wrench, label: "Wrench" },
  sparkles: { icon: Sparkles, label: "Sparkles" },
  factory: { icon: Factory, label: "Factory" },
  zap: { icon: Zap, label: "Lightning" },
  building: { icon: Building2, label: "Building" },
  dumbbell: { icon: Dumbbell, label: "Dumbbell" },
  scale: { icon: Scale, label: "Scales" },
  "paw-print": { icon: PawPrint, label: "Paw print" },
  briefcase: { icon: Briefcase, label: "Briefcase" },
}

export function categoryIcon(key?: string): LucideIcon {
  return (key && CATEGORY_ICONS[key]?.icon) || Briefcase
}


export const textareaClass =
  "min-h-24 w-full resize-none rounded-md border border-input bg-card px-4 py-3 text-body2 text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-foreground"
