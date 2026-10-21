import type { UserRole } from "../enums/user-role";

export interface User {
  id: string;
  email: string;
  role: UserRole;
}