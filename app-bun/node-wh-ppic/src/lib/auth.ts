export type Role = "ADMIN" | "WH_SUPERVISOR" | "WH_STAFF" | "PPIC" | "QC" | "SECURITY" | "BYPRODUCT" | "MAINTENANCE" | "MIXING" | "PACKING1" | "PACKING25" | "MILLING" | "INTAKE" | "PGA" | "FPS" | "PESTCONTROL" | "OB" | "RND" | "SUPPLIER" | "CIVIL" | "K3" | "SAFETY" | "PREMIX" | "BDS";

export interface User {
  username: string;
  name: string;
  role: Role;
  department: string;
  token: string;
}

const USERS: Record<string, User> = {
  admin: { username: "admin", name: "System Admin", role: "ADMIN", department: "IT", token: "mock-token-admin" },
  wh_supervisor: { username: "wh_supervisor", name: "Budi Santoso", role: "WH_SUPERVISOR", department: "Gudang", token: "mock-token-sup" },
  wh_staff: { username: "wh_staff", name: "Andi Saputra", role: "WH_STAFF", department: "Gudang", token: "mock-token-staff" },
  ppic: { username: "ppic", name: "Siti Rahma", role: "PPIC", department: "PPIC", token: "mock-token-ppic" },
  qc: { username: "qc", name: "Dewi Lestari", role: "QC", department: "Quality Control", token: "mock-token-qc" },
  security: { username: "security", name: "Bambang Pamungkas", role: "SECURITY", department: "Security", token: "mock-token-sec" },
  prod: { username: "prod", name: "Rudi Hartono", role: "BYPRODUCT", department: "Byproduct", token: "mock-token-prod" },
  mtc: { username: "mtc", name: "Hendra Wijaya", role: "MAINTENANCE", department: "Maintenance", token: "mock-token-mtc" },
};

export const auth = {
  login: (username: string, password: string): User | null => {
    // Mock passwords
    const validPassword = username === "admin" ? "admin123" : "123";
    if (USERS[username] && password === validPassword) {
      const user = USERS[username];
      localStorage.setItem("wh_ppic_user", JSON.stringify(user));
      return user;
    }
    return null;
  },
  
  logout: () => {
    localStorage.removeItem("wh_ppic_user");
    window.location.href = "/login";
  },
  
  getUser: (): User | null => {
    const userStr = localStorage.getItem("wh_ppic_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },
  
  hasAccess: (userRole: Role, allowedRoles: Role[]) => {
    return allowedRoles.includes(userRole);
  }
};
