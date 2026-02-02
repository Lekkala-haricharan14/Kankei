export type Role = 'Admin' | 'Trainer' | 'Client';

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  avatarUrl?: string; // For UI
}
