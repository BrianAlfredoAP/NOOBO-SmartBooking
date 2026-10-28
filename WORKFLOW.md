# Workflow Membangun Project dari Nol dengan Cursor CLI Free

> Stack: **Vite untuk frontend** dan **NestJS untuk backend**. Database, ORM, UI framework, dan detail deployment dipilih setelah kebutuhan aplikasi jelas.
>
> Tujuan: belajar sambil membangun, menjaga implementasi tetap sederhana, dan menyiapkan deployment Docker ke server sendiri/VPS.
>
> **Penting:** fitur/domain aplikasi belum ditentukan. Jangan mengarang kebutuhan produk.

## Prinsip utama

1. Bangun secara bertahap; jangan meminta Agent membuat seluruh aplikasi sekaligus.
2. Kamu tetap memutuskan kebutuhan dan menyetujui keputusan arsitektur penting.
3. Cursor Agent membantu eksplorasi, implementasi, pengujian, dan dokumentasi.
4. Selesaikan satu *vertical slice*—satu alur fitur dari frontend sampai backend/database—sebelum pindah ke fitur berikutnya.
5. Gunakan skill hanya ketika relevan. Skill tidak menjamin penghematan token; prompt yang jelas, scope kecil, dan context yang terjaga lebih berpengaruh.
6. Jangan menambahkan cache, message broker, microservices, atau infrastruktur tambahan tanpa kebutuhan yang jelas.

## 0. Persiapan lokal

Buat repository baru:

```bash
mkdir nama-project
cd nama-project
git init
agent
```

Sesuaikan `nama-project` dengan nama project. Sebelum membuat perubahan, periksa status Git:

```bash
git status --short
```

Jangan memasukkan secret, token, atau kredensial ke repository.

## 1. Fase Define — tentukan kebutuhan

**Tujuan:** mengetahui masalah yang ingin diselesaikan dan menentukan MVP sebelum memilih teknologi lebih jauh.

Prompt untuk Cursor CLI:

```text
Saya ingin membangun aplikasi fullstack dari nol dengan frontend dan backend terpisah.

Tujuan saya bukan hanya menyelesaikan aplikasi, tetapi juga memahami keputusan engineering yang dibuat.

Untuk tahap ini:
- Jangan membuat atau mengubah file.
- Jangan mengasumsikan fitur, domain bisnis, atau kebutuhan aplikasi.
- Bantu saya mengidentifikasi informasi yang harus ditentukan sebelum development.
- Kelompokkan kebutuhan menjadi product requirements, functional requirements,
  non-functional requirements, constraints, dan acceptance criteria.
- Jelaskan istilah teknis penting secara singkat.
- Ajukan pertanyaan yang benar-benar diperlukan secara bertahap.
- Jangan menetapkan database atau detail teknologi yang belum diputuskan.

Akhiri dengan ringkasan keputusan yang sudah diketahui dan daftar keputusan yang masih terbuka.
```

**Kriteria selesai:**
- Tujuan aplikasi dapat dijelaskan dengan jelas.
- Pengguna sasaran dan masalah yang ingin diselesaikan diketahui.
- Scope MVP dan acceptance criteria disepakati.
- Kebutuhan yang belum diketahui dicatat, bukan diasumsikan.

## 2. Fase Choose Stack — konfirmasi stack

Stack frontend dan backend sudah ditentukan:
- **Frontend:** Vite.
- **Backend:** NestJS.

Pilihan lain—misalnya framework UI, database, ORM, autentikasi, dan strategi deployment—harus mengikuti kebutuhan aplikasi.

Prompt:

```text
Stack utama yang sudah diputuskan:
- Frontend: Vite.
- Backend: NestJS.
- Frontend dan backend harus menjadi aplikasi terpisah.

Berdasarkan kebutuhan produk yang telah disepakati, rekomendasikan pilihan yang
masih belum ditentukan, termasuk:
- library/framework UI frontend bila dibutuhkan;
- bahasa dan tooling frontend;
- database;
- ORM atau pendekatan akses database;
- validasi input dan API contract;
- testing;
- package manager;
- strategi Docker untuk development dan production.

Untuk keputusan yang berpengaruh besar, berikan maksimal 3 alternatif yang relevan,
beserta trade-off dan rekomendasimu. Prioritaskan kemudahan belajar, pemeliharaan,
keamanan, dan kompleksitas minimum yang sesuai kebutuhan.

Jangan install dependency atau membuat file dulu. Tunggu persetujuan saya.
```

**Kriteria selesai:** stack lengkap disetujui dan alasan keputusan utama dipahami.

## 3. Fase Design — rancang arsitektur

Prompt:

```text
Rancang arsitektur awal berdasarkan kebutuhan dan stack yang telah disetujui.

Keputusan tetap:
- Frontend: Vite.
- Backend: NestJS.
- Keduanya aplikasi terpisah.

Tugas:
1. Tentukan tanggung jawab frontend, backend, dan database jika digunakan.
2. Usulkan struktur folder minimal untuk frontend dan backend.
3. Tentukan cara frontend berkomunikasi dengan backend.
4. Rancang API contract awal hanya berdasarkan kebutuhan yang telah disepakati.
5. Jelaskan validasi input, error handling, konfigurasi environment, dan batas keamanan.
6. Tentukan strategi testing yang sesuai.
7. Rancang pendekatan Docker untuk development dan production.
8. Catat keputusan yang masih terbuka.

Jangan menambahkan microservices, message broker, cache, atau infrastruktur tambahan
tanpa kebutuhan yang jelas. Jangan implementasikan kode dahulu.

Sajikan diagram arsitektur sederhana, struktur folder, trade-off, dan alasan tiap
keputusan. Tunggu persetujuan saya.
```

Struktur ilustratif (bukan keharusan):

```text
nama-project/
├── frontend/        # Vite app
├── backend/         # NestJS app
├── docs/
│   ├── requirements.md
│   ├── architecture.md
│   └── api-contract.md
├── compose.yaml     # dibuat pada fase Docker
├── .gitignore
└── README.md
```

**Kriteria selesai:** alur request dari browser ke backend dan database dapat dijelaskan, serta keputusan arsitektur telah direview.

## 4. Fase Bootstrap — buat fondasi project

Gunakan skill **Ponytail** bila sudah terpasang dan sesuai. Jangan menganggap nama slash command atau subcommand tertentu tersedia sebelum memeriksa skill yang terpasang.

Prompt:

```text
Implementasikan bootstrap project sesuai arsitektur dan stack yang telah disetujui.

Scope:
- Buat aplikasi frontend menggunakan Vite.
- Buat aplikasi backend menggunakan NestJS.
- Gunakan package manager yang sudah diputuskan dan simpan lockfile.
- Siapkan konfigurasi TypeScript, linting, dan formatting sesuai stack.
- Siapkan .gitignore dan .env.example bila dibutuhkan.
- Buat health-check endpoint sederhana pada backend.
- Buat halaman frontend minimal untuk membuktikan aplikasi berjalan.
- Dokumentasikan perintah instalasi, development, lint, typecheck, dan test yang tersedia.

Batasan:
- Jangan membuat fitur bisnis yang belum didefinisikan.
- Hindari dependency tanpa alasan.
- Jangan menyimpan secret atau kredensial di repository.
- Jangan mengubah keputusan arsitektur tanpa persetujuan.
- Jangan melanjutkan ke fitur bisnis.

Jalankan pemeriksaan yang tersedia. Jelaskan file penting dan cara menjalankan
frontend serta backend secara lokal.
```

Verifikasi:

```bash
git status --short
git diff --check
```

Jalankan perintah lint, typecheck, test, dan development yang benar-benar tersedia pada `package.json` masing-masing aplikasi.

**Kriteria selesai:** Vite dan NestJS dapat dijalankan secara lokal, health check backend berfungsi, dan struktur dasar dipahami.

## 5. Fase Build — kerjakan satu vertical slice

Jangan membuat semua halaman sekaligus atau semua endpoint sekaligus. Pilih satu fitur yang sudah disetujui dan selesaikan alurnya.

Prompt template:

```text
Implementasikan satu vertical slice untuk kebutuhan berikut:

[NAMA DAN DESKRIPSI FITUR YANG SUDAH DISEPAKATI]

Acceptance criteria:
- [KRITERIA 1]
- [KRITERIA 2]
- [KRITERIA 3]

Sebelum coding:
- Periksa file frontend dan backend yang relevan.
- Identifikasi perubahan API contract dan database jika diperlukan.
- Berikan rencana singkat dan risiko kompatibilitas.

Saat coding:
- Ikuti pola dan dependency yang sudah ada.
- Implementasikan hanya fitur ini.
- Tambahkan validasi, error handling, dan test yang relevan.
- Jangan menambahkan fitur sampingan atau melakukan refactor besar.

Setelah coding:
- Jalankan test dan pemeriksaan yang relevan.
- Verifikasi alur dari frontend Vite ke API NestJS.
- Laporkan file yang berubah, hasil pemeriksaan, dan hal yang belum diverifikasi.
- Berhenti setelah acceptance criteria terpenuhi.
```

Setelah implementasi, jika ada bagian yang belum dipahami, tanyakan:

```text
Jelaskan alur request fitur ini dari frontend Vite ke backend NestJS.
Fokus pada file yang berubah. Jelaskan tanggung jawab setiap layer, alasan
pendekatan yang dipilih, dan satu alternatif yang lebih sederhana jika ada.
Jangan mengubah kode.
```

**Kriteria selesai:** satu alur fitur berfungsi end-to-end dan bisa dijelaskan.

## 6. Fase Verify — testing dan review

Prompt:

```text
Review perubahan terbaru untuk fitur [NAMA FITUR].

Periksa:
- Kesesuaian dengan acceptance criteria.
- Bug pada alur normal dan edge cases.
- Validasi input dan otorisasi backend bila relevan.
- Error handling.
- Konsistensi frontend dengan API contract.
- Potensi kebocoran secret atau data.
- Test yang belum mencakup perilaku penting.

Periksa diff dan kode terkait; jangan membaca seluruh repository tanpa alasan.
Jalankan pemeriksaan yang tersedia. Jangan mengklaim test berhasil jika belum dijalankan.
Perbaiki hanya masalah dalam scope fitur ini dan laporkan risiko yang tersisa.
```

Urutan pemeriksaan yang disarankan:
1. Unit test untuk fungsi yang berubah.
2. Integration test untuk interaksi antar-layer.
3. Lint dan typecheck.
4. End-to-end test untuk alur pengguna yang penting.

Pilih tingkat testing sesuai risiko fitur; tidak semua perubahan membutuhkan seluruh rangkaian.

## 7. Fase Docker — containerization lokal

Lakukan setelah alur dasar aplikasi stabil. Jangan deploy ke server atau mengubah sistem remote tanpa persetujuan.

Prompt:

```text
Siapkan Docker untuk aplikasi frontend Vite dan backend NestJS berdasarkan
konfigurasi project yang telah disetujui.

Kebutuhan:
- Dockerfile yang sesuai untuk frontend dan backend.
- Compose configuration untuk service yang dibutuhkan.
- Environment variables dikonfigurasi secara aman.
- Health checks bila sesuai.
- Persistent storage untuk data yang perlu dipertahankan.
- Strategi migration database yang terkendali bila database digunakan.
- Secret tidak dimasukkan ke image atau repository.
- Dokumentasi build, start, stop, logs, dan troubleshooting.

Pisahkan konfigurasi development dan production bila memang dibutuhkan.
Jangan mengekspos database langsung ke internet.
Jangan menghapus volume saat cleanup.
Jangan menambahkan layanan yang tidak diperlukan.

Jelaskan konfigurasi penting dan cara menguji container secara lokal.
Jalankan pemeriksaan yang tersedia dan laporkan hasil aktual.
```

**Catatan khusus Vite:** frontend yang dibuild untuk production biasanya berupa aset statis. Tentukan cara menyajikannya—misalnya melalui web server di dalam container—berdasarkan kebutuhan aplikasi. Jangan menganggap server development Vite sebagai server production.

**Kriteria selesai:** frontend dan backend dapat dijalankan melalui Docker secara lokal, dan persistensi data telah diuji jika database digunakan.

## 8. Fase Deploy — VPS

Prompt:

```text
Buat rencana deployment untuk aplikasi frontend Vite dan backend NestJS ke VPS.

Jangan melakukan perubahan remote dahulu. Susun langkah yang mencakup:
- Prasyarat server dan akses SSH.
- Build image dan strategi pengiriman image.
- Konfigurasi environment production dan secret.
- Domain dan HTTPS jika diperlukan.
- Firewall dan pembatasan akses database.
- Migration database dan backup/restore bila database digunakan.
- Health checks, logs, restart policy, dan troubleshooting.
- Prosedur rollback.
- Checklist verifikasi setelah deployment.

Bedakan langkah yang aman diuji secara lokal dan langkah yang mengubah server.
Tandai keputusan yang masih memerlukan persetujuan saya.
```

Setelah rencana direview, jalankan langkah deployment secara bertahap. Verifikasi endpoint, logs, konektivitas, persistensi data, dan prosedur pemulihan sebelum menyatakan deployment selesai.

## 9. Fase Documentation — tutup project

Prompt:

```text
Audit README dan dokumentasi project.

Pastikan dokumentasi menjelaskan:
- Prasyarat.
- Cara menjalankan frontend Vite dan backend NestJS secara lokal.
- Environment variables yang diperlukan.
- Cara menjalankan lint, typecheck, dan test yang tersedia.
- Cara menjalankan Docker.
- Migration dan backup jika database digunakan.
- Prosedur deployment dan pemeriksaan logs.
- Keterbatasan yang diketahui.

Cocokkan instruksi dengan file konfigurasi dan perintah yang benar-benar ada.
Perbaiki dokumentasi yang tidak akurat. Jangan menambahkan fitur baru atau
mengklaim test, backup, dan deployment berhasil tanpa verifikasi.
```

## Strategi penggunaan Ponytail, Caveman, dan quota

- **Ponytail:** gunakan ketika mengimplementasikan fitur, melakukan refactor, atau mengevaluasi apakah solusi terlalu rumit. Periksa instruksi `SKILL.md` yang benar-benar terpasang.
- **Caveman:** gunakan ketika ingin respons ringkas. Jangan sampai ringkasnya jawaban menghilangkan penjelasan yang sedang kamu perlukan untuk belajar.
- **Jangan aktifkan keduanya untuk setiap task secara otomatis.** Pilih berdasarkan tujuan pekerjaan.
- Simpan instruksi project yang pendek di `AGENTS.md`; dokumentasi detail tetap di `docs/`.
- Berikan scope, acceptance criteria, dan file terkait dengan jelas.
- Gunakan `/summarize` atau mulai sesi baru ketika context sudah menumpuk. Bawa ringkasan keputusan, status, dan pekerjaan berikutnya.
- Periksa `git diff` dan test sebelum commit.
- Skill tidak menjamin pengurangan quota; hindari putaran Agent yang tidak perlu dan context yang tidak relevan.

### Checklist kemajuan

- [ ] Kebutuhan dan MVP disepakati.
- [ ] Stack frontend Vite dan backend NestJS dikonfirmasi.
- [ ] Database, tooling, dan arsitektur disetujui sesuai kebutuhan.
- [ ] Bootstrap lokal berjalan.
- [ ] Satu vertical slice berhasil.
- [ ] Testing dan review dilakukan.
- [ ] Docker lokal berjalan.
- [ ] Deployment VPS diverifikasi.
- [ ] Dokumentasi sesuai implementasi.

**Mulai dari Fase 1.** Jangan menentukan fitur, database, autentikasi, atau library UI sebelum kebutuhan aplikasinya diketahui. Simpan file ini sebagai `WORKFLOW.md` di root repository agar bisa menjadi panduan sepanjang project.
