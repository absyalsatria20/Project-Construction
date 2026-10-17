# Panduan Penguatan Keamanan CPMS

Panduan ini untuk migrasi dari login custom ke Supabase Auth, lalu mengaktifkan Row Level Security (RLS).

Jangan menjalankan seluruh langkah sekaligus. Kerjakan berurutan dan uji setiap tahap.

## Kondisi keamanan saat ini

Project saat ini memiliki beberapa risiko:

- Login username/password masih dikelola aplikasi.
- Password disimpan plaintext di `localStorage`.
- Password juga disimpan plaintext di tabel Supabase `accounts`.
- Status login memakai `cpms_auth` di `localStorage`.
- RLS belum dipastikan aktif dan memiliki policy yang benar.

Risiko terbesar: jika browser, database, atau akses aplikasi bocor, password dapat terbaca.

## Aturan penting

- Jangan aktifkan RLS produksi sebelum policy selesai diuji.
- Jangan menguji migrasi pertama langsung di database produksi.
- Jangan menjalankan SQL yang berisi `DROP TABLE`.
- Jangan mengirim password, API key, atau `service_role key` ke chat, GitHub, atau screenshot.
- Jangan memasukkan `service_role key` ke frontend atau environment variable yang diawali `NEXT_PUBLIC_`.
- Jangan hapus login lama sebelum login baru berhasil diuji.
- Simpan backup di lokasi berbeda dari Supabase.

## Tahap 0 — Backup data

1. Buka aplikasi.
2. Export seluruh data dari fitur backup aplikasi.
3. Simpan file backup di dua lokasi aman.
4. Jangan upload file backup ke repositori publik atau layanan berbagi publik.
5. Pastikan backup tidak berisi password plaintext.
6. Jika backup masih berisi password, jangan kirim atau bagikan file tersebut.
7. Buat juga backup database dari Supabase Dashboard jika tersedia.
8. Catat tanggal dan lokasi backup.

Backup browser penting, tetapi jangan menganggapnya sebagai satu-satunya backup produksi.

## Tahap 1 — Amankan akun dan akses project

Kerjakan tahap ini sebelum migrasi Auth atau RLS. Tahap ini tidak mengubah kode aplikasi maupun database.

### Akun Supabase

1. Buka Supabase Dashboard.
2. Aktifkan MFA untuk akun pemilik project.
3. Gunakan password unik untuk akun Supabase.
4. Jangan gunakan password Supabase pada layanan lain.
5. Periksa daftar anggota project dan hapus akses yang tidak diperlukan.
6. Gunakan role akses paling rendah yang cukup untuk setiap anggota.
7. Periksa aktivitas dan log project secara berkala.
8. Jangan membagikan akses Dashboard melalui akun bersama.

### Akun GitHub

1. Aktifkan MFA.
2. Gunakan password unik.
3. Periksa daftar OAuth apps, personal access tokens, deploy keys, dan collaborators.
4. Hapus token, deploy key, atau collaborator yang tidak dikenal.
5. Pastikan repository project tidak public jika berisi data atau konfigurasi sensitif.
6. Periksa Git history untuk credential yang mungkin pernah ter-commit.
7. Jika credential pernah masuk Git history, revoke atau rotate credential tersebut. Menghapus file saja tidak cukup.

### Akun Vercel

1. Aktifkan MFA jika tersedia.
2. Gunakan password unik.
3. Periksa team members dan hapus akses yang tidak diperlukan.
4. Periksa project settings dan deployment history.
5. Periksa environment variables.
6. Jangan menaruh password, service key, atau credential database di variable frontend.
7. Setelah rotate credential, redeploy project agar nilai baru aktif.

### Environment variables dan API key

Frontend hanya boleh menggunakan:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Pastikan `service_role key` tidak pernah berada di:

- file `src/`;
- frontend JavaScript;
- GitHub;
- environment variable `NEXT_PUBLIC_*`;
- screenshot atau chat;
- file backup yang dibagikan.

`anon key` memang dapat terlihat di frontend. `service_role key` tidak boleh.

Jika `service_role key`, password database, token GitHub, atau credential lain pernah terpublikasi:

1. Revoke atau rotate credential segera.
2. Periksa log penggunaan credential.
3. Periksa perubahan data dan deployment.
4. Redeploy aplikasi jika credential tersimpan di Vercel.
5. Jangan hanya menghapus credential dari file lokal; credential lama tetap berisiko sampai di-revoke.

### Perangkat dan browser

1. Gunakan Windows Update dan update browser terbaru.
2. Aktifkan antivirus dan Windows Security.
3. Jangan memasang extension browser yang tidak dipercaya.
4. Gunakan password manager.
5. Kunci komputer saat ditinggalkan.
6. Jangan login Supabase, GitHub, atau Vercel dari komputer umum.
7. Hindari Wi-Fi publik untuk membuka Dashboard tanpa VPN yang dipercaya.
8. Logout dari Dashboard pada perangkat yang bukan milik sendiri.
9. Jangan menyimpan backup project di folder yang tersinkron ke akun publik.

### Checklist selesai

- [ ] MFA Supabase aktif.
- [ ] MFA GitHub aktif.
- [ ] MFA Vercel aktif jika tersedia.
- [ ] Password tiap akun unik.
- [ ] Anggota dan token akses sudah diperiksa.
- [ ] Tidak ada `service_role key` di frontend atau GitHub.
- [ ] Environment variables Vercel sudah diperiksa.
- [ ] Backup aplikasi dan database tersimpan aman.
- [ ] Credential yang pernah bocor sudah di-rotate.

Tahap ini hanya mengamankan akun dan akses. Tidak ada perubahan kode atau database.


## Tahap 2 — Buat project Supabase testing

Jangan gunakan database produksi untuk percobaan pertama.

1. Buat project Supabase testing terpisah.
2. Import struktur database dari `schema.sql`.
3. Jangan menjalankan SQL historis yang bersifat destructive.
4. Masukkan data contoh, bukan data produksi penting.
5. Hubungkan environment lokal ke project testing.
6. Uji fitur berikut:
   - login;
   - membaca data;
   - tambah data;
   - edit data;
   - hapus data;
   - export backup;
   - import backup;
   - loading state;
   - realtime sync.

Tujuan tahap ini: kesalahan Auth atau RLS tidak merusak data produksi.

## Tahap 3 — Siapkan Supabase Auth

Login baru memakai email/password Supabase Auth.

Di Supabase Dashboard:

1. Buka `Authentication`.
2. Buka `Providers`.
3. Aktifkan provider `Email`.
4. Tentukan apakah email confirmation diperlukan.
5. Buka daftar `Users`.
6. Buat user admin project.
7. Simpan email dan password di password manager.
8. Jangan menyimpan password di file project.
9. Uji login user tersebut pada project testing.

Supabase Auth menggantikan login custom. Supabase yang mengelola password dan session.

## Tahap 4 — Ubah aplikasi agar memakai Supabase Auth

Perubahan kode yang perlu dilakukan nanti:

1. Ubah `login()` custom menjadi `supabase.auth.signInWithPassword()`.
2. Ubah logout menjadi `supabase.auth.signOut()`.
3. Baca session saat aplikasi mulai.
4. Pantau perubahan session melalui `onAuthStateChange`.
5. Ubah form `LoginView` dari username menjadi email.
6. Hapus pembacaan password dari `localStorage`.
7. Hapus penyimpanan `cpms_user_password`.
8. Jangan lagi membaca password dari tabel `accounts`.
9. Jangan masukkan password ke file backup aplikasi.
10. Pertahankan login custom sementara jika diperlukan untuk rollback.
11. Hapus login custom hanya setelah login Supabase Auth stabil.

File utama yang kemungkinan berubah:

- `src/components/LoginView.tsx`
- `src/context/AppContext.tsx`
- `src/utils/supabase.ts`

Perubahan tahap ini perlu dikerjakan dan diuji sebagai task terpisah. Jangan mengubahnya sebelum siap melakukan test login menyeluruh.

## Tahap 5 — Siapkan RLS

RLS membatasi siapa yang boleh membaca dan mengubah data Supabase.

Tabel yang perlu ditinjau:

- `vendors`
- `categories`
- `petty_cash_categories`
- `subcategories`
- `materials`
- `invoices`
- `payments`
- `cashflows`
- `petty_cashes`
- `accounts`

Untuk project satu user, policy awal dapat membatasi seluruh operasi hanya kepada user yang sudah login.

Konsep policy awal:

- User login boleh `SELECT`.
- User login boleh `INSERT`.
- User login boleh `UPDATE`.
- User login boleh `DELETE` jika fitur memang membutuhkan hapus.
- User tanpa session ditolak.

Jangan menyalin SQL policy tanpa memeriksa struktur tabel dan kebutuhan akses.

RLS yang salah dapat menyebabkan:

- aplikasi tidak bisa membaca data;
- aplikasi tidak bisa menyimpan data;
- data tetap terbuka terlalu lebar;
- user dapat mengubah data yang bukan haknya.

## Tahap 6 — Uji RLS di project testing

Jalankan semua test berikut sebelum menyentuh produksi:

1. Buka aplikasi tanpa login.
   - Data tidak boleh terbaca.
2. Login sebagai user admin.
   - Data harus terbaca.
3. Tambah vendor.
   - Harus berhasil.
4. Tambah invoice.
   - Harus berhasil.
5. Tambah pembayaran.
   - Harus berhasil.
6. Edit data.
   - Harus berhasil.
7. Hapus data yang memang boleh dihapus.
   - Harus berhasil.
8. Logout.
   - Akses data harus ditolak.
9. Coba akses REST API tanpa session.
   - Harus ditolak.
10. Coba akses tabel dari browser tanpa login.
   - Data tidak boleh terbuka.
11. Test backup dan restore pada database testing.
12. Test realtime sync.
13. Jalankan perintah:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

## Tahap 7 — Tambahkan perlindungan database

Setelah Auth dan RLS stabil:

1. Tambahkan unique constraint nomor invoice di database.
2. Pastikan constraint tidak gagal karena data lama yang sudah duplikat.
3. Cari dan bereskan duplikat di database testing lebih dulu.
4. Uji tambah invoice dengan nomor sama.
5. Uji edit invoice tanpa mengganti nomor.
6. Uji edit invoice menjadi nomor milik invoice lain.
7. Terapkan migration ke produksi hanya setelah test berhasil.

Validasi di UI tetap dipertahankan. Constraint database menjadi lapisan perlindungan kedua.

## Tahap 8 — Migrasi ke produksi

Lakukan hanya setelah project testing lulus.

1. Buat backup produksi terbaru.
2. Pastikan backup dapat dibaca.
3. Deploy kode Supabase Auth ke Vercel.
4. Uji login produksi.
5. Uji logout dan login ulang.
6. Aktifkan policy RLS produksi.
7. Uji baca data.
8. Uji tambah data.
9. Uji edit data.
10. Uji hapus data yang diizinkan.
11. Pantau Supabase Logs.
12. Pantau Vercel Logs.
13. Jika stabil, hapus login custom.
14. Hapus password plaintext dari `localStorage`.
15. Hapus password dari tabel `accounts` setelah tidak diperlukan.
16. Jika password lama pernah dipakai di layanan lain, ganti password tersebut.

## Tahap 9 — Backup rutin

Buat kebiasaan backup:

- Backup database terjadwal.
- Simpan salinan di lokasi berbeda.
- Jangan simpan backup publik.
- Uji restore secara berkala di database testing.
- Catat tanggal backup terakhir.
- Simpan minimal beberapa versi backup.

Backup tidak mencegah hacker, tetapi mengurangi dampak jika data terhapus atau diubah.

## Urutan singkat

1. Backup data.
2. Aktifkan MFA Supabase, GitHub, dan Vercel.
3. Buat project Supabase testing.
4. Siapkan Supabase Auth.
5. Ubah aplikasi ke Supabase Auth.
6. Uji login.
7. Aktifkan dan uji RLS di testing.
8. Tambahkan unique constraint database.
9. Deploy ke produksi.
10. Aktifkan RLS produksi.
11. Hapus password plaintext.
12. Jalankan backup rutin.

## Status fitur terkait saat ini

- Offline queue: sudah tersedia di `src/context/AppContext.tsx`.
- Realtime Sync: sudah tersedia di `src/context/AppContext.tsx` melalui `postgres_changes`.
- Loading state Supabase: sudah tersedia.
- Validasi nomor invoice di UI: sudah tersedia.
- Validasi pembayaran melebihi sisa invoice: sudah tersedia.
- Supabase Auth: belum dimigrasikan.
- RLS: belum dipastikan aktif dengan policy yang benar.
- Password plaintext: masih menjadi risiko dan belum dihapus.
