export const applicationDemoStatus = Object.freeze({
  received: 'Pengajuan Diterima',
  nextStep: 'Menunggu proses persetujuan Pembina dan pemeriksaan Logistik Kampus.',
})

export function createDemoApplication({ sequence, fsk, room, logistics, supervisorEmail, createdAt = new Date().toISOString() }) {
  return {
    id: `NOOBO-SIM-${String(sequence).padStart(3, '0')}`,
    status: applicationDemoStatus.received,
    nextStep: applicationDemoStatus.nextStep,
    borrower: { name: fsk.borrowerName, organization: fsk.organization, whatsapp: fsk.whatsapp },
    event: { name: fsk.eventName, participants: fsk.participants, date: fsk.date, endDate: fsk.endDate || fsk.date, startTime: fsk.startTime, endTime: fsk.endTime },
    room: { ...room },
    logistics: logistics.map((item) => ({ ...item })),
    supervisorEmail,
    createdAt,
  }
}
