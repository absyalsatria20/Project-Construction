# Progress

## 2026-10-17
- Tambah tab independen `Cashflow Green House` dengan state, kategori, CRUD, localStorage, dan struktur Supabase terpisah.
- Tambah transaksi Debit/Kredit dengan validasi satu sisi dan saldo berjalan.
- File: `src/components/CashflowGreenHouseView.tsx`, `src/context/AppContext.tsx`, `src/app/page.tsx`, `src/components/MainLayout.tsx`, `schema.sql`.
- Verifikasi: `npm run typecheck` berhasil. Lint, build, dan pengujian UI belum dijalankan.


## 2026-10-17

- Memperbaiki import backup Petty Cash ke Supabase.
- Menambahkan upload `pettyCashCategories` saat import data.
- Menambahkan `category_id` pada payload `petty_cashes` saat import data.
- Verifikasi: `npm run typecheck` berhasil.
- Verifikasi: `npm run lint` berhasil tanpa warning/error.
- Menghapus folder `Query Supabase/` karena hanya berisi catatan query lama dan tidak direferensikan aplikasi.
- Memperbarui `schema.sql` agar mencakup tabel Petty Cash, kolom `updated_at`, trigger, index, dan default kategori Petty Cash yang sesuai aplikasi.
- Verifikasi: `npm run typecheck`, `npm run lint`, dan `git diff --check` berhasil.
- Menambahkan fitur edit pembayaran pada histori invoice.
- Edit pembayaran memakai validasi sisa tagihan tanpa menghitung pembayaran yang sedang diedit dua kali.
- Verifikasi fitur: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Menambahkan loading state awal saat mengambil data Supabase.
- Menambahkan tampilan error pemuatan data dengan tombol `Coba Lagi`.
- Mode localStorage tetap langsung tampil tanpa loading Supabase.
- Verifikasi loading state: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Menambahkan validasi nomor invoice duplikat tanpa membedakan huruf besar-kecil; invoice yang sedang diedit dikecualikan.
- Menambahkan perlindungan double-submit untuk simpan invoice dan pembayaran menggunakan lock `useRef` serta tombol disabled saat proses berjalan.
- Verifikasi validasi dan double-submit: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Membuat `SECURITY_MIGRATION_GUIDE.md` berisi panduan bertahap backup, MFA, Supabase Auth, RLS, testing, migrasi produksi, dan backup rutin.
- Tidak ada perubahan kode aplikasi atau database pada tahap ini.
- Memperluas `SECURITY_MIGRATION_GUIDE.md` dengan checklist keamanan akun Supabase, GitHub, Vercel, API key, perangkat, browser, dan tindakan saat credential bocor.
- Tidak ada perubahan kode aplikasi atau database pada tahap ini.
- Menambahkan empty state berbeda untuk data kosong dan hasil filter kosong pada Invoice, Material, dan Cashflow.
- Verifikasi empty state: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Merapikan modal dan toolbar import/export `Cashflow Green House` agar mengikuti pola Cashflow: ukuran modal responsif, header/footer tetap, body bisa scroll, tombol aksi konsisten, dan input kategori baru memakai alur yang jelas.
- File: `src/components/CashflowGreenHouseView.tsx`.
- Verifikasi: `npm run typecheck`, `npm run lint`, dan `npm run build` berhasil setelah membersihkan cache `.next` yang stale.
- Menyamakan modal input transaksi Green House dengan modal Cashflow: struktur JSX multiline, field Dana Masuk/Pengeluaran, blok kategori, nominal Rupiah, spacing, header/footer, dan tombol aksi.
- File: `src/components/CashflowGreenHouseView.tsx`.
- Verifikasi: `npm run typecheck`, `npm run lint`, dan `npm run build` berhasil.
- Menyamakan tata letak dan bentuk modal input Green House dengan modal input tab Cashflow lama, termasuk class input, label, blok Pengeluaran, animasi, spacing, dan tombol.
- File: `src/components/CashflowGreenHouseView.tsx`.
- Verifikasi: `npm run typecheck`, `npm run lint`, dan `npm run build` berhasil.
