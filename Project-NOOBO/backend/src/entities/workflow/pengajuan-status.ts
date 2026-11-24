export const PENGAJUAN_STATUS = {
  SUBMITTED: 'SUBMITTED',
  WAITING_PEMBINA: 'WAITING_PEMBINA',
  REJECTED_PEMBINA: 'REJECTED_PEMBINA',
  WAITING_LOGISTIK: 'WAITING_LOGISTIK',
  REVISION_LOGISTIK: 'REVISION_LOGISTIK',
  REJECTED_LOGISTIK: 'REJECTED_LOGISTIK',
  APPROVED_LOGISTIK: 'APPROVED_LOGISTIK',
  ONGOING: 'ONGOING',
  RETURN_REPORTED: 'RETURN_REPORTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type PengajuanStatus =
  (typeof PENGAJUAN_STATUS)[keyof typeof PENGAJUAN_STATUS];

const TRANSITIONS: Record<PengajuanStatus, readonly PengajuanStatus[]> = {
  SUBMITTED: ['WAITING_PEMBINA', 'CANCELLED'],
  WAITING_PEMBINA: [
    'WAITING_LOGISTIK',
    'REJECTED_PEMBINA',
    'EXPIRED',
    'CANCELLED',
  ],
  REJECTED_PEMBINA: [],
  WAITING_LOGISTIK: [
    'APPROVED_LOGISTIK',
    'REVISION_LOGISTIK',
    'REJECTED_LOGISTIK',
    'CANCELLED',
  ],
  REVISION_LOGISTIK: [
    'WAITING_LOGISTIK',
    'REJECTED_LOGISTIK',
    'CANCELLED',
  ],
  REJECTED_LOGISTIK: [],
  APPROVED_LOGISTIK: ['ONGOING'],
  ONGOING: ['RETURN_REPORTED'],
  RETURN_REPORTED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
  EXPIRED: [],
};

export const ACTIVE_LOGISTIK_STATUSES: readonly PengajuanStatus[] = [
  PENGAJUAN_STATUS.WAITING_LOGISTIK,
  PENGAJUAN_STATUS.REVISION_LOGISTIK,
];

export function canTransition(from: string, to: string): boolean {
  const allowed = TRANSITIONS[from as PengajuanStatus];
  return Boolean(allowed?.includes(to as PengajuanStatus));
}

export const CANCELLABLE_STATUSES: readonly PengajuanStatus[] = [
  PENGAJUAN_STATUS.SUBMITTED,
  PENGAJUAN_STATUS.WAITING_PEMBINA,
  PENGAJUAN_STATUS.WAITING_LOGISTIK,
  PENGAJUAN_STATUS.REVISION_LOGISTIK,
];

/**
 * Label status dalam Bahasa Indonesia, dipakai agar UI frontend tidak perlu
 * memetakan sendiri nilai enum backend.
 */
export const PENGAJUAN_STATUS_LABEL: Record<PengajuanStatus, string> = {
  SUBMITTED: 'Pengajuan Diterima',
  WAITING_PEMBINA: 'Menunggu Persetujuan Pembina',
  REJECTED_PEMBINA: 'Ditolak Pembina',
  WAITING_LOGISTIK: 'Menunggu Pemeriksaan Logistik',
  REVISION_LOGISTIK: 'Perlu Perbaikan',
  REJECTED_LOGISTIK: 'Ditolak Logistik',
  APPROVED_LOGISTIK: 'Disetujui',
  ONGOING: 'Dipinjam',
  RETURN_REPORTED: 'Menunggu Pemeriksaan Pengembalian',
  COMPLETED: 'Selesai',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kedaluwarsa',
};

export function statusLabel(status: string): string {
  return PENGAJUAN_STATUS_LABEL[status as PengajuanStatus] ?? status;
}
