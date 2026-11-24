import { statusLabel } from '../entities/workflow/pengajuan-status.js';

type Row = Record<string, unknown>;

function dateOnly(value: unknown): string {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return String((value as string | number) ?? '').slice(0, 10);
}

function text(value: unknown, fallback = ''): string {
  return value == null ? fallback : String(value as string | number | boolean);
}

function parseFasilitas(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== 'string' || value.length === 0) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function supervisorStatus(status: string): string {
  if (status === 'WAITING_PEMBINA' || status === 'SUBMITTED') return 'Menunggu Persetujuan Pembina';
  if (status === 'REJECTED_PEMBINA') return 'Ditolak Pembina';
  return 'Disetujui';
}

function logisticsStatus(status: string): string {
  if (status === 'WAITING_LOGISTIK') return 'Menunggu pemeriksaan Logistik';
  if (status === 'REVISION_LOGISTIK') return 'Perlu Perbaikan';
  if (status === 'REJECTED_LOGISTIK') return 'Ditolak Logistik';
  if (
    status === 'APPROVED_LOGISTIK' ||
    status === 'ONGOING' ||
    status === 'RETURN_REPORTED' ||
    status === 'COMPLETED'
  ) {
    return 'Disetujui';
  }
  return 'Menunggu';
}

function nextStep(status: string): string {
  switch (status) {
    case 'WAITING_PEMBINA':
      return 'Menunggu persetujuan Pembina.';
    case 'WAITING_LOGISTIK':
      return 'Menunggu pemeriksaan Logistik Kampus.';
    case 'REVISION_LOGISTIK':
      return 'Logistik meminta perbaikan pengajuan.';
    case 'APPROVED_LOGISTIK':
      return 'Menunggu penerbitan SBP oleh Logistik.';
    case 'ONGOING':
      return 'Kegiatan berlangsung; laporkan pengembalian setelah selesai.';
    case 'RETURN_REPORTED':
      return 'Menunggu pemeriksaan pengembalian oleh Logistik.';
    case 'COMPLETED':
      return 'Kegiatan selesai.';
    case 'REJECTED_PEMBINA':
    case 'REJECTED_LOGISTIK':
      return 'Pengajuan ditolak.';
    default:
      return '';
  }
}

export interface RequestViewExtras {
  history?: Row[];
  return_details?: Row[];
}

export function toRequestView(
  row: Row,
  pkg: { room: Row | null; logistics: Row[] },
  extras: RequestViewExtras = {},
): Record<string, unknown> {
  const status = text(row.status);
  const room = pkg.room
    ? {
        id: String(row.id_ruangan ?? pkg.room.id_ruangan),
        name: text(pkg.room.nama_ruangan),
        code: text(pkg.room.kode_ruangan),
        building: text(pkg.room.gedung) || text(pkg.room.lokasi),
        floor: text(pkg.room.lantai),
        category: text(pkg.room.jenis),
        capacity: Number(pkg.room.kapasitas ?? 0),
        equipment: parseFasilitas(pkg.room.fasilitas),
        condition: text(pkg.room.kondisi_fasilitas, 'Baik'),
        available: Boolean(pkg.room.status_aktif),
      }
    : null;

  return {
    id: String(row.id_pengajuan),
    id_pengajuan: Number(row.id_pengajuan),
    nomor_pengajuan: text(row.nomor_pengajuan),
    id_fsk: Number(row.id_fsk),
    status: statusLabel(status),
    status_code: status,
    nextStep: nextStep(status),
    borrower: {
      name: text(row.borrower_nama),
      email: text(row.borrower_email),
      organization: text(row.organization),
      whatsapp: text(row.whatsapp),
    },
    event: {
      name: text(row.nama_kegiatan),
      date: dateOnly(row.tanggal_mulai),
      endDate: dateOnly(row.tanggal_selesai),
      startTime: text(row.waktu_mulai),
      endTime: text(row.waktu_selesai),
      participants: Number(row.jumlah_peserta ?? 0),
      purpose: text(row.tujuan_kegiatan),
    },
    room,
    logistics: pkg.logistics.map((item) => ({
      id: String(item.id_logistik),
      label: text(item.nama_logistik),
      category: text(item.jenis),
      quantity: Number(item.jumlah ?? 0),
      unit: text(item.satuan, 'unit'),
      stock: Number(item.stok_total ?? 0),
    })),
    supervisorEmail: text(row.email_pembina),
    supervisorStatus: supervisorStatus(status),
    logisticsStatus: logisticsStatus(status),
    pembina: supervisorStatus(status),
    logistik: logisticsStatus(status),
    canIssueSbp: status === 'APPROVED_LOGISTIK',
    sbpPublished: Boolean(row.nomor_sbp),
    returned: Boolean(row.id_sbpg),
    rejectionReason: text(row.alasan_penolakan),
    logisticsNote: text(row.catatan_logistik),
    createdAt: row.tanggal_pengajuan ?? null,
    sbp: row.nomor_sbp
      ? {
          nomor_sbp: text(row.nomor_sbp),
          tanggal_terbit: row.tanggal_terbit ?? null,
          lokasi_dokumen: text(row.lokasi_dokumen),
        }
      : null,
    sbpg: row.id_sbpg
      ? {
          id_sbpg: Number(row.id_sbpg),
          waktu_kirim: row.waktu_kirim ?? null,
          batas_waktu_kirim: row.batas_waktu_kirim ?? null,
          status_ketepatan_waktu: text(row.status_ketepatan_waktu),
          catatan_peminjam: text(row.catatan_peminjam),
        }
      : null,
    history: (extras.history ?? []).map((entry) => ({
      from_status: entry.from_status ?? null,
      to_status: entry.to_status,
      actor_type: entry.actor_type,
      actor_id: entry.actor_id ?? null,
      note: entry.note ?? '',
      at: entry.at ?? null,
    })),
    return_details: extras.return_details ?? [],
  };
}
