# Error Codes — SmartBooking Campus API

Semua error dikembalikan dengan format global:

```json
{
  "statusCode": 409,
  "code": "ROOM_NAME_TAKEN",
  "message": "Nama ruangan sudah digunakan",
  "errors": [],
  "path": "/api/v1/rooms",
  "timestamp": "2026-11-22T00:00:00.000Z"
}
```

## Umum

| Code | HTTP | Arti |
| --- | --- | --- |
| `BAD_REQUEST` | 400 | Permintaan tidak valid |
| `VALIDATION_ERROR` | 400 | Validasi DTO gagal; detail di `errors[]` |
| `UNAUTHORIZED` | 401 | Tidak/buruk auth token |
| `FORBIDDEN` | 403 | Peran/akses tidak diizinkan |
| `NOT_FOUND` | 404 | Resource tidak ada |
| `CONFLICT` | 409 | Konflik umum |
| `INTERNAL_ERROR` | 500 | Error tak tertangani |

## Auth & Master Data

| Code | HTTP | Dipakai |
| --- | --- | --- |
| `ROOM_NAME_TAKEN` | 409 | Sprint 1 — nama ruangan duplikat |
| `ROOM_STATUS_INVALID` | 400 | Sprint 1 — transisi status ruangan ditolak |
| `ROOM_IN_USE` | 409 | Sprint 1 — ruangan dipakai pengajuan aktif |
| `LOGISTIC_NAME_TAKEN` | 409 | Sprint 1 — nama logistik duplikat |
| `LOGISTIC_STOCK_INVALID` | 400 | Sprint 1 — stok negatif/perubahan stok invalid |
| `LOGISTIC_IN_USE` | 409 | Sprint 1 — logistik dipakai pengajuan aktif |
| `PEMBINA_EMAIL_TAKEN` | 409 | Sprint 1 — email pembina duplikat |
| `PEMBINA_IN_USE` | 409 | Sprint 1 — pembina dipakai pengajuan aktif |
| `LOAN_RULE_INVALID` | 400 | Sprint 1 — aturan tidak lengkap |
| `LOAN_RULE_NAME_TAKEN` | 409 | Sprint 1 — nama aturan duplikat |
| `LOAN_RULE_IN_USE` | 409 | Sprint 1 — aturan dipakai pengajuan aktif |

## FSK

| Code | HTTP | Dipakai |
| --- | --- | --- |
| `FSK_INVALID_CAPACITY` | 400 | Sprint 2 — `jumlah_peserta` ≤ 0 |
| `FSK_INVALID_SCHEDULE` | 400 | Sprint 2 — tanggal mulai setelah selesai atau di masa lalu; detail di `errors[]` |
| `FSK_INVALID_DETAIL` | 400 | Sprint 2 — `jumlah` detail kebutuhan ≤ 0 |

## Rekomendasi

| Code | HTTP | Dipakai |
| --- | --- | --- |
| `NO_PACKAGE_AVAILABLE` | 404 | Sprint 3 — tidak ada ruangan/barang yang lolos filter ketersediaan |
| `PACKAGE_UNAVAILABLE` | 409 | Sprint 3 — ketersediaan berubah saat paket dipilih; detail di `errors[]` |

## Direncanakan (Sprint 4+)

`APPROVAL_TOKEN_USED`, `APPROVAL_TOKEN_EXPIRED`, `ROOM_CONFLICT`, `STOCK_INSUFFICIENT`, `DOCUMENT_NOT_AVAILABLE`, `APPROVAL_INCOMPLETE`.
