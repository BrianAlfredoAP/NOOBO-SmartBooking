export interface UserRecord {
  id_user: number;
  role_id: number;
  role: string;
  nama: string;
  email: string;
  password_hash: string;
  status_aktif: boolean;
  created_at: Date;
  whatsapp?: string | null;
}
