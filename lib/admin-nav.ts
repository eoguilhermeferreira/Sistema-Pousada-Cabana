import {
  LayoutDashboard,
  Calendar,
  BedDouble,
  Users,
  ClipboardList,
  UserCheck,
  Package,
  Wallet,
  FileText,
  Bot,
  IdCard,
  Clock,
  BarChart3,
  Settings,
} from "lucide-react";

import type { NavItem } from "@/types/nav";

export const adminNavItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Calendário", href: "/admin/calendario", icon: Calendar },
  { label: "Quartos", href: "/admin/quartos", icon: BedDouble },
  { label: "Hóspedes", href: "/admin/hospedes", icon: Users },
  { label: "Reservas", href: "/admin/reservas", icon: ClipboardList },
  {
    label: "Check-in / Check-out",
    href: "/admin/checkin-checkout",
    icon: UserCheck,
  },
  { label: "Estoque", href: "/admin/estoque", icon: Package },
  { label: "Caixa", href: "/admin/caixa", icon: Wallet },
  { label: "Nota Fiscal", href: "/admin/nota-fiscal", icon: FileText },
  { label: "Chatbot", href: "/admin/chatbot", icon: Bot },
  { label: "Funcionários", href: "/admin/funcionarios", icon: IdCard },
  { label: "Bater Ponto", href: "/admin/bater-ponto", icon: Clock },
  { label: "Relatórios", href: "/admin/relatorios", icon: BarChart3 },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];
