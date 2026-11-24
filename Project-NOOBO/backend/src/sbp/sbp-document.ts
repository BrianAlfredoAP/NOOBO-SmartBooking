import { createRequire } from 'node:module';
import path from 'node:path';
import pdfmake from 'pdfmake';
import Roboto from 'pdfmake/fonts/Roboto.js';

const require = createRequire(import.meta.url);
const FONT_DIR = path.join(
  path.dirname(require.resolve('pdfmake/package.json')),
  'fonts',
);

let fontsRegistered = false;

function registerFonts(): void {
  if (fontsRegistered) return;
  pdfmake.setLocalAccessPolicy(
    (filePath: string) => filePath.startsWith(FONT_DIR),
  );
  pdfmake.setUrlAccessPolicy(() => false);
  pdfmake.addFonts(Roboto);
  fontsRegistered = true;
}

export interface SbpDocumentData {
  nomor_sbp: string;
  tanggal_terbit: Date;
  nomor_pengajuan: string;
  nama_peminjam: string;
  email_peminjam: string;
  whatsapp: string;
  nama_kegiatan: string;
  tujuan_kegiatan: string;
  tanggal_mulai: Date;
  tanggal_selesai: Date;
  waktu_mulai: string;
  waktu_selesai: string;
  jumlah_peserta: number;
  pembina: string;
  ruangan: string[];
  logistik: Array<{ nama: string; jumlah: number; satuan: string }>;
}

export async function renderSbpPdf(data: SbpDocumentData): Promise<Buffer> {
  registerFonts();

  const document = {
    info: {
      title: `SBP ${data.nomor_sbp}`,
      author: 'SmartBooking Campus',
      subject: data.nama_kegiatan,
    },
    content: [
      { text: 'SURAT BUKTI PEMINJAMAN', style: 'title' },
      { text: `Nomor: ${data.nomor_sbp}`, style: 'subtitle' },
      {
        text: `Diterbitkan: ${formatDateTime(data.tanggal_terbit)}`,
        style: 'subtitle',
      },
      { text: 'Data Peminjam', style: 'section' },
      {
        layout: 'noBorders',
        table: {
          widths: [140, '*'],
          body: [
            row('Nama', data.nama_peminjam),
            row('Email', data.email_peminjam),
            row('WhatsApp', data.whatsapp || '-'),
          ],
        },
      },
      { text: 'Informasi Kegiatan', style: 'section' },
      {
        layout: 'noBorders',
        table: {
          widths: [140, '*'],
          body: [
            row('Nama kegiatan', data.nama_kegiatan),
            row('Tujuan', data.tujuan_kegiatan || '-'),
            row('Nomor pengajuan', data.nomor_pengajuan),
            row(
              'Jadwal',
              `${formatDate(data.tanggal_mulai)} ${data.waktu_mulai} - ${formatDate(data.tanggal_selesai)} ${data.waktu_selesai}`,
            ),
            row('Jumlah peserta', String(data.jumlah_peserta)),
            row('Pembina', data.pembina || '-'),
          ],
        },
      },
      { text: 'Ruangan', style: 'section' },
      {
        ul: data.ruangan.length > 0 ? data.ruangan : ['Tidak ada ruangan'],
      },
      { text: 'Logistik', style: 'section' },
      {
        ul:
          data.logistik.length > 0
            ? data.logistik.map(
                (item) => `${item.nama} — ${item.jumlah} ${item.satuan}`,
              )
            : ['Tidak ada logistik'],
      },
      {
        text: 'Dokumen ini diterbitkan oleh Logistik Kampus dan wajib dibawa saat penggunaan fasilitas.',
        style: 'notice',
      },
    ],
    defaultStyle: { font: 'Roboto', fontSize: 11 },
    styles: {
      title: { fontSize: 18, bold: true, alignment: 'center' },
      subtitle: { fontSize: 10, color: '#555555', alignment: 'center' },
      section: { fontSize: 13, bold: true, margin: [0, 16, 0, 6] },
      notice: { fontSize: 9, italics: true, color: '#666666', margin: [0, 24, 0, 0] },
    },
  };

  return pdfmake.createPdf(document).getBuffer();
}

function row(label: string, value: string): Array<Record<string, unknown>> {
  return [
    { text: label, color: '#555555' },
    { text: value },
  ];
}

function formatDate(value: Date): string {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateTime(value: Date): string {
  const hours = String(value.getHours()).padStart(2, '0');
  const minutes = String(value.getMinutes()).padStart(2, '0');
  return `${formatDate(value)} ${hours}:${minutes}`;
}
