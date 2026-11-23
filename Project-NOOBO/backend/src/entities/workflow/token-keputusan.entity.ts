import { createHash, randomBytes } from 'node:crypto';

export const TOKEN_STATUS = {
  UNUSED: 'UNUSED',
  USED: 'USED',
  EXPIRED: 'EXPIRED',
} as const;

const DEFAULT_TTL_MS = 48 * 60 * 60 * 1000;

export function hashDecisionToken(rawToken: string): string {
  return createHash('sha256').update(rawToken).digest('hex');
}

export class TokenKeputusan {
  private _id_notifikasi: number;
  private _id_pengajuan: number;
  private _token_hash: string;
  private _dibuat_pada: Date;
  private _kedaluwarsa_pada: Date;
  private _waktu_digunakan: Date | null;
  private _status: string;
  private _keputusan: string | null;
  private _alasan: string | null;

  constructor(
    id_notifikasi: number,
    id_pengajuan: number,
    token_hash: string = '',
    dibuat_pada: Date = new Date(),
    kedaluwarsa_pada: Date = new Date(Date.now() + DEFAULT_TTL_MS),
    waktu_digunakan: Date | null = null,
    status: string = TOKEN_STATUS.UNUSED,
    keputusan: string | null = null,
    alasan: string | null = null,
  ) {
    this._id_notifikasi = id_notifikasi;
    this._id_pengajuan = id_pengajuan;
    this._token_hash = token_hash;
    this._dibuat_pada = dibuat_pada;
    this._kedaluwarsa_pada = kedaluwarsa_pada;
    this._waktu_digunakan = waktu_digunakan;
    this._status = status;
    this._keputusan = keputusan;
    this._alasan = alasan;
  }

  public get id_notifikasi(): number {
    return this._id_notifikasi;
  }

  public get id_pengajuan(): number {
    return this._id_pengajuan;
  }

  public get token_hash(): string {
    return this._token_hash;
  }

  public get dibuat_pada(): Date {
    return this._dibuat_pada;
  }

  public get kedaluwarsa_pada(): Date {
    return this._kedaluwarsa_pada;
  }

  public get waktu_digunakan(): Date | null {
    return this._waktu_digunakan;
  }

  public get status(): string {
    return this._status;
  }

  public get keputusan(): string | null {
    return this._keputusan;
  }

  public get alasan(): string | null {
    return this._alasan;
  }

  public generateToken(ttlMs: number = DEFAULT_TTL_MS): string {
    const rawToken = randomBytes(32).toString('hex');
    const now = new Date();
    this._token_hash = hashDecisionToken(rawToken);
    this._dibuat_pada = now;
    this._kedaluwarsa_pada = new Date(now.getTime() + ttlMs);
    this._waktu_digunakan = null;
    this._status = TOKEN_STATUS.UNUSED;
    this._keputusan = null;
    this._alasan = null;
    return rawToken;
  }

  public isExpired(now: Date = new Date()): boolean {
    return now.getTime() >= this._kedaluwarsa_pada.getTime();
  }

  public validateToken(now: Date = new Date()): boolean {
    return this._status === TOKEN_STATUS.UNUSED && !this.isExpired(now);
  }

  public markAsUsed(decision: string, reason: string | null = null): boolean {
    if (this._status !== TOKEN_STATUS.UNUSED) {
      return false;
    }
    this._waktu_digunakan = new Date();
    this._status = TOKEN_STATUS.USED;
    this._keputusan = decision;
    this._alasan = reason;
    return true;
  }

  public markAsExpired(): boolean {
    if (this._status !== TOKEN_STATUS.UNUSED) {
      return false;
    }
    this._status = TOKEN_STATUS.EXPIRED;
    return true;
  }

  public viewDecision(): object {
    return {
      status: this._status,
      keputusan: this._keputusan,
      alasan: this._alasan,
      waktu_digunakan: this._waktu_digunakan,
      kedaluwarsa_pada: this._kedaluwarsa_pada,
    };
  }

  static fromRow(row: Record<string, unknown>): TokenKeputusan {
    return new TokenKeputusan(
      Number(row.id_notifikasi),
      Number(row.id_pengajuan),
      String(row.token_hash),
      toDate(row.dibuat_pada),
      toDate(row.kedaluwarsa_pada),
      row.waktu_digunakan === null || row.waktu_digunakan === undefined
        ? null
        : toDate(row.waktu_digunakan),
      String(row.status),
      row.keputusan === null || row.keputusan === undefined
        ? null
        : String(row.keputusan as string | number),
      row.alasan === null || row.alasan === undefined
        ? null
        : String(row.alasan as string | number),
    );
  }
}

function toDate(value: unknown): Date {
  return value instanceof Date ? value : new Date(String(value));
}
