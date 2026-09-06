import { UserAccount, UserRole, RolePermissions } from "@/types";

export const SEEDED_USERS: (UserAccount & { passwordHash: string })[] = [
  {
    id: "usr-admin-01",
    email: "admin@pakmec.com",
    name: "Yasir Aslam",
    role: "admin",
    department: "Managing Director & Chief Engineer",
    phone: "+92 300 8631100",
    avatarUrl: "/avatars/admin.png",
    passwordHash: "Yasir@123..",
  },
  {
    id: "usr-mach-01",
    email: "machinist@pakmec.com",
    name: "Rashid Ali (CNC Lead)",
    role: "machinist",
    department: "Shop Floor & Machine Operations",
    phone: "+92 321 4458921",
    avatarUrl: "/avatars/machinist.png",
    passwordHash: "pakmec2026!",
  },
  {
    id: "usr-sales-01",
    email: "sales@pakmec.com",
    name: "Zainab Khan (Estimator)",
    role: "sales",
    department: "Client Relations & Quotations",
    phone: "+92 301 7762244",
    avatarUrl: "/avatars/sales.png",
    passwordHash: "pakmec2026!",
  },
];

export function getRolePermissions(role: UserRole): RolePermissions {
  switch (role) {
    case "admin":
      return {
        canViewFinancials: true,
        canRecordSettlements: true,
        canDeleteOrArchive: true,
        canManageSettings: true,
        canCreateQuotes: true,
        canManageProduction: true,
      };
    case "machinist":
      return {
        canViewFinancials: false, // Redacts revenue, total inflow, balances
        canRecordSettlements: false,
        canDeleteOrArchive: false,
        canManageSettings: false,
        canCreateQuotes: false,
        canManageProduction: true, // Full control over Kanban, QC, pins
      };
    case "sales":
      return {
        canViewFinancials: true, // Can see quote values and job costs
        canRecordSettlements: false, // Cannot record bank settlements
        canDeleteOrArchive: false, // Cannot wipe clients
        canManageSettings: false, // Cannot change machine hourly rates
        canCreateQuotes: true, // Full access to Auto-Quoter
        canManageProduction: false,
      };
  }
}

export async function verifyCredentials(email: string, password: string): Promise<UserAccount | null> {
  const normalizedEmail = email.trim().toLowerCase().replace(/,com$/, '.com');
  const user = SEEDED_USERS.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    return null;
  }

  // Check password (allow configured password or master demo fallback for admin)
  const isMatch = user.passwordHash === password.trim() || 
    (user.role === "admin" && password.trim() === "pakmec2026!");

  if (!isMatch) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return {
    ...safeUser,
    lastLogin: new Date().toISOString(),
  };
}

export function getUserById(id: string): UserAccount | null {
  const user = SEEDED_USERS.find(u => u.id === id);
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

export function getUserByRole(role: UserRole): UserAccount {
  const user = SEEDED_USERS.find(u => u.role === role) || SEEDED_USERS[0];
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
