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

## 2026-10-20
- Memperbaiki urutan ledger dan saldo berjalan pada tab `Cashflow Green House`.
- Saldo kini dihitung memakai urutan canonical `transactionDate`, `rowIndex`, lalu `id`.
- Urutan tampilan ASC/DESC memakai comparator yang sama; saldo tetap melekat pada transaksi yang benar setelah transaksi tanggal lama ditambahkan atau tanggal transaksi diedit.
- Tab Cashflow lama tidak diubah.
- File: `src/components/CashflowGreenHouseView.tsx`.
- Verifikasi: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Menyesuaikan UI tabel rekap kategori Green House dengan UI Cashflow lama saat mode `Kelola`.
- Menambahkan tombol export rekap Excel/PDF, mode tambah/edit kategori, tombol Batal, dialog hapus, dan layout responsive untuk mobile.
- Menyesuaikan baris rekap agar nama kategori panjang dan nominal tidak bertabrakan pada layar kecil.
- Cashflow lama tidak diubah.
- File: `src/components/CashflowGreenHouseView.tsx`.
- Verifikasi: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Revisi UI kelola kategori mengikuti Cashflow lama: tambah kategori, pilih banyak, pilih semua, hapus terpilih, edit inline, simpan, batal, dan ikon edit/hapus.
- Verifikasi revisi: `npm run typecheck`, `npm run lint`, `npm run build`, dan `git diff --check` berhasil.
- Menyamakan alur hapus kategori dengan Cashflow lama: dialog konfirmasi, hapus banyak, hasil kategori terblokir, dan ikon aksi edit/hapus.
- Mengambil referensi stabil Petty Cash untuk bulk action bar: checkbox kategori tetap satu baris dengan nama, popup aksi `Batal`/`Hapus Banyak`, dan popup aksi sama untuk tabel transaksi Green House.
- Input tambah kategori memakai placeholder `Nama kategori` dan tombol `Tambah` tetap di sebelah input pada mobile.
- Memperbaiki style kotak input `Nama kategori` pada Green House mengikuti Petty Cash, tanpa mengubah Petty Cash.
- Menghapus teks `Hapus Terpilih` dari kontrol kelola kategori; penghapusan tetap melalui popup aksi dan dialog konfirmasi.
- Memperbaiki filter jenis, kategori, dan rentang tanggal Green House agar memakai input berkotak, border, radius, focus state, dan ukuran konsisten dengan Petty Cash.
- Menukar style kotak pencarian deskripsi transaksi dan input `Nama kategori` pada Green House sesuai permintaan, tanpa mengubah Petty Cash.
- Menyamakan ukuran, spacing, border, typography, tombol, dan transisi warna input tambah kategori Green House dengan blok tambah kategori Petty Cash.
- Menstabilkan tabel Cashflow Green House mengikuti struktur tabel Petty Cash: lebar minimum konsisten `1100px`, header sticky, backdrop blur, dan wrapper overflow horizontal yang sama.
- Petty Cash tidak diubah.
- Memperbaiki posisi pagination Green House dengan menambahkan parent `relative`, sama seperti Petty Cash, agar posisi page tidak bergeser saat pindah tab.
- Menyamakan kotak pencarian deskripsi transaksi Green House dengan Petty Cash: ukuran teks, warna latar, border focus, dan transition.
- Menyamakan mode edit kategori Green House dengan Petty Cash: layout satu baris, input berkotak, tombol `Simpan` dan `Batal` tetap sejajar pada mobile.
- Petty Cash tidak diubah.
- Verifikasi: `npm run typecheck`, `npm run lint`, dan `git diff --check` berhasil.
