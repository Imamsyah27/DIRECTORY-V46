# Portal Monitoring Pelanggan — Panduan Setup

Paket ini menambahkan 2 hal baru ke project `DIRECTORY-V8` Anda, **tanpa mengubah**
data atau tabel `orders`/`products`/`tagar_batches` yang sudah ada:

1. **Menu baru "👤 Akun Pelanggan"** di dashboard admin Anda (`index.html`) — untuk
   membuat & mengelola akun login pelanggan.
2. **Website terpisah di folder `/pelanggan`** — khusus pelanggan login dan
   memantau progress langganan harian mereka sendiri (read-only, tidak bisa
   edit apa pun).

## 1. Jalankan SQL (WAJIB, sekali saja)

Buka **Supabase Dashboard → SQL Editor** di project yang sama dengan `config.js`
Anda, lalu jalankan seluruh isi file:

```
sql/customer_portal.sql
```

Ini akan membuat tabel `customer_accounts`, `app_admin_settings`, dan semua
fungsi login/monitoring/reset password. Aman dijalankan di database yang
sudah berisi data `orders` lama Anda — tidak ada data yang terhapus.

## 2. PIN Admin

Menu "Akun Pelanggan" dikunci PIN (default: **123456**). Setelah masuk pertama
kali, langsung ganti lewat bagian "🔑 Ganti PIN Admin" di bagian bawah menu
tersebut. Jangan bagikan PIN atau URL admin ke pelanggan.

## 3. Cara Membuat Akun Pelanggan

1. Buka dashboard admin → menu **Akun Pelanggan** → masukkan PIN.
2. Di form "Buat Akun Pelanggan Baru", pilih nama pelanggan dari dropdown
   **"Pilih dari Pelanggan Aktif"** (otomatis diambil dari data Dashboard Aktif
   BEM/LEM/SEM yang belum punya akun), atau ketik manual di kolom
   "Nama / Kode Pelanggan".
   - Nama `"Pelanggan 88"` dan `"88"` dianggap **sama** secara otomatis.
3. Isi username, nomor WhatsApp (opsional, sekadar catatan kontak), dan
   password (atau klik 🎲 untuk generate otomatis).
4. Klik **Buat Akun**. Setelah berhasil, muncul pop-up berisi username +
   password yang bisa langsung disalin untuk dikirim ke pelanggan lewat WhatsApp.

Pelanggan tersebut, saat login di portal `/pelanggan`, **hanya akan melihat**
baris-baris pesanan miliknya sendiri (dicocokkan otomatis lewat nama pemesan),
dari dashboard BEM, LEM, maupun SEM sekaligus.

## 4. Deploy Portal Pelanggan

Folder `pelanggan/` adalah website statis terpisah (login & dashboard).
Upload folder ini ke hosting Anda, misalnya sebagai:
- Subfolder di domain yang sama: `namadomainanda.com/pelanggan`
- Atau subdomain terpisah: `pelanggan.namadomainanda.com`

Bagikan link tersebut + username/password ke masing-masing pelanggan.

## 5. Fitur yang Tersedia untuk Pelanggan

- Login dengan username & password.
- Dashboard **read-only**: ringkasan jumlah langganan aktif, total hari
  terkirim vs total hari paket, dan detail progress per tagar/pesanan
  (termasuk status "sudah dicatat hari ini / belum").
- **Ganti password** sendiri (perlu password lama).
- **Lupa password**: TIDAK ada fitur reset mandiri. Kalau pelanggan lupa
  password, mereka menghubungi Anda, lalu Anda reset lewat tombol 🔁
  "Reset Password" di menu Akun Pelanggan (dashboard admin).
- Sesi login otomatis berakhir setelah 7 hari (harus login ulang), dan akun
  otomatis terkunci 15 menit setelah 5x salah password berturut-turut.

## 5b. Fitur untuk Admin

- **Ganti PIN Admin** di bagian bawah menu "Akun Pelanggan" — ini adalah
  "password" untuk membuka menu kelola akun pelanggan itu sendiri. Ganti
  dari default `123456` sesegera mungkin.

## 6. Fitur Tambahan yang Bisa Dikembangkan Nanti (saran)

- Notifikasi WhatsApp otomatis (butuh integrasi WhatsApp Business API) saat
  langganan pelanggan mendekati/limit habis.
- Riwayat harian (log setiap kali admin ceklis pengiriman), bukan cuma
  angka total, supaya pelanggan bisa lihat kalender.
- Multi-bahasa / mode gelap pada portal pelanggan.
- Ekspor riwayat langganan pelanggan ke PDF.
- Autentikasi lebih kuat lewat Supabase Auth (email/OTP) jika ke depan
  volume pelanggan sudah besar dan butuh keamanan tingkat produksi.

## Catatan Keamanan

Seperti dashboard admin Anda yang sekarang (tabel `orders` bisa diakses penuh
lewat anon key tanpa login), arsitektur ini juga masih **client-side saja**
(tanpa server backend). Yang sudah diperbaiki di sini:
- Password pelanggan **di-hash** (bukan disimpan polos) dan **tidak pernah**
  bisa dibaca langsung lewat anon key — hanya lewat fungsi database khusus.
- Setiap pelanggan hanya bisa mengambil data miliknya sendiri lewat fungsi
  `get_my_orders`, yang memverifikasi sesi login (bukan sekadar filter di
  browser yang bisa dilewati).
- Menu admin dikunci PIN terpisah dari anon key.

Untuk keamanan tingkat produksi yang lebih tinggi (mis. jika akan dipakai
banyak pelanggan/data sensitif), pertimbangkan migrasi ke Supabase Auth +
Row Level Security berbasis JWT di masa depan.

## Update: Fitur Baru Portal Pelanggan

**WAJIB:** jalankan ulang seluruh `sql/customer_portal_fixed.sql` di Supabase SQL Editor
(menambah tabel `customer_order_labels`, fungsi `customer_set_order_label`, dan
memperluas `get_my_orders` dengan kolom `inisial`). Tidak ada data yang dihapus.

- **Bahasa**: Indonesia, English, Tiếng Việt, العربية (otomatis RTL). Tombol ID/EN/VI/AR
  di atas halaman; pilihan tersimpan di browser.
- **Nama inisial**: di atas setiap tagar ada label pribadi (maks. 30 karakter) yang bisa
  ditambah/diubah pelanggan sendiri. Hanya label ini yang bisa diedit pelanggan;
  data langganan lainnya tetap read-only.
- **Limit Tercapai**: kartu ringkasan yang bisa diklik untuk memfilter daftar hanya
  langganan yang sudah limit.
- **Akan Limit Besok**: kartu ringkasan berisi jumlah tagar yang akan limit besok; klik
  untuk melihat tabelnya. Logikanya: setelah pencatatan hari ini, sisa hari tinggal 1.

## Update: Pencarian Tagar & Hapus Semua Tagar

- **Portal pelanggan**: kolom "Cari tagar langganan Anda" di atas daftar. Hasilnya langsung
  menjawab apakah tagar sudah terdata (hijau) atau belum (merah). Tanda `#` diabaikan dan
  tidak peka huruf besar/kecil. Tidak perlu SQL tambahan.
- **Portal admin**: di modal List Tagar Akun > tab Daftar & Edit ada tombol
  "Hapus Semua Tagar". Harus mengetik kata HAPUS sebelum tombol konfirmasi aktif.

## Update: Tampilan Admin Baru + CashFlow

**File admin yang berubah:** `index.html`, `js/dashboard.js`, `js/app.js`.
**File admin baru:** `theme-pro.css`, `js/pro-ui.js`, `js/cashflow.js`.
**SQL baru (wajib untuk CashFlow):** jalankan `sql/cashflow.sql` sekali di Supabase SQL Editor
(setelah `customer_portal_fixed.sql` pernah dijalankan, karena memakai PIN admin).

- Pengalih tampilan di header: Dashboard | List-Farm (menu Produk) | CashFlow.
- Tabel langganan aktif: kolom bisa diurutkan, ada Tgl Mulai, Est. Selesai, Sisa Durasi,
  dan tombol 💬 pengingat WhatsApp untuk langganan yang sisa <= 3 hari / sudah limit.
- CashFlow: batch -> isi nama, produk, harga, jumlah -> total per baris & total keseluruhan
  otomatis -> "Tandai Sudah Diambil" mengunci batch -> buat batch berikutnya.
- Untuk kembali ke tampilan lama: hapus baris <link> theme-pro.css di index.html.

---

## Update: Supply & Stock, Pengumuman, Arsip Pelanggan

Jalankan **sekali** di Supabase SQL Editor: `sql/supply.sql` (juga `sql/farmsell.sql` dan `sql/havsell.sql`
bila menu Farm Sell / HAV Sell dipakai). Semua aman dijalankan ulang.

- **Admin → DIRECTORY → Supply & Stock**: tab *Stok* (batch + akun + total otomatis, stok tiap akun bisa diedit) dan tab *Order* (pesanan pelanggan, centang jika sudah dikirim).
- **Admin → SETTING → Pengumuman**: buat pengumuman untuk semua pelanggan atau hanya BEM / SEM / LEM, bisa disematkan dan diberi batas tayang.
- **Portal pelanggan**: tab *Beranda* (grafik + ringkasan), *Supply & Stock* (lihat total stok, pesan jumlah), *Arsip Saya* (hanya arsip milik username yang login).
- Pelanggan hanya melihat TOTAL stok, bukan rincian per akun. Stok tidak berkurang otomatis saat ada order; admin mengubahnya manual.
- Bahasa baru di portal tersedia untuk ID dan EN; VI dan AR menampilkan teks Indonesia untuk bagian baru.

---

## Update: Perpanjang Langganan + Tampilan Kontras Baru

**WAJIB:** jalankan **sekali** `sql/perpanjang.sql` di Supabase SQL Editor (setelah `customer_portal_fixed.sql` dan `supply.sql`). Aman dijalankan ulang, tidak ada data lama yang dihapus.

**File baru:** `sql/perpanjang.sql`, `js/perpanjang.js` (admin), `pelanggan/js/renewal.js` (pelanggan).
**File berubah:** `index.html`, `js/dashboard.js`, `theme-dark.css`, `pelanggan/dashboard.html`, `pelanggan/config.js`, `pelanggan/js/dashboard.js`, `pelanggan/js/portal-extra.js`, `pelanggan/theme-dark.css`.

### Alur untuk pelanggan
1. Langganan yang sudah **limit** (di Beranda maupun Arsip Saya) punya tombol **🔄 Perpanjang**.
2. Pelanggan mengisi: **jumlah hari** (bebas 1–365, ada pilihan cepat 7/14/30/60/90), **paket BEM / SEM / LEM**, dan **tagar** (tetap atau ganti baru).
3. Klik **Kirim Permintaan** -> status **Menunggu Konfirmasi** + pemberitahuan agar menghubungi admin lewat WhatsApp **085269368022** (tombol langsung ke WhatsApp dengan pesan terisi).
4. Tab baru **Perpanjangan** menampilkan semua permintaan beserta statusnya (Menunggu / Disetujui / Ditolak + catatan admin). Permintaan yang masih menunggu bisa dibatalkan.

### Alur untuk admin
- Di **Dashboard**, panel **🔔 Permintaan Perpanjangan** muncul di tab **BEM / LEM / SEM** sesuai paket yang dipesan; tab dan menu Dashboard menampilkan angka jumlah permintaan menunggu.
- Panel meminta **PIN admin** (sama dengan menu Akun Pelanggan; tersimpan selama tab browser terbuka).
- **✅ Setujui** -> langganan baru dibuat di Dashboard Aktif paket yang dipesan (H0/H<hari>, tagar sesuai permintaan); langganan lama yang sudah limit otomatis pindah ke **Arsip**, dan nama inisial pelanggan ikut dibawa.
- **✖ Tolak** -> bisa menulis catatan yang akan terlihat oleh pelanggan.

### Tampilan
Latar diganti dari hitam pekat ke biru-tinta, teks lebih terang, ukuran huruf tabel dinaikkan, aksen **emas**, dan warna status yang mencolok (cyan = proses, oranye = mendekati limit, hijau mint = selesai, merah muda = ditolak/bahaya). Berlaku di dashboard admin dan portal pelanggan.

Catatan bahasa: teks fitur perpanjangan tersedia dalam Indonesia dan English; VI/AR menampilkan teks Indonesia (sama seperti fitur Supply & Stock).

---

## Update: Ganti Tema Warna (Putih / Hitam / Biru / Pink)

Tidak perlu SQL. Tombol **Putih · Hitam · Biru · Pink** tampil di:
- **Portal pelanggan**: di atas halaman, sebaris dengan tombol bahasa (login & dashboard).
- **Dashboard admin**: di header, sebelah kanan menu.

Pilihan tersimpan di browser masing-masing (admin dan pelanggan terpisah) dan langsung terpasang saat halaman dibuka lagi. Grafik ikut berganti warna. Default: **Biru**.

**File baru:** `themes.css`, `theme-switch.js` (salinan yang sama ada di folder `pelanggan/`).
**Mengubah warna tema:** edit nilai di `themes.css` (satu blok per tema). Menambah tema baru: salin satu blok, ganti `data-theme="..."`, lalu tambahkan namanya di `THEMES`/`LABEL` pada `theme-switch.js`.

## Update: Gambar Produk per Batch (Supply & Stock)

1. Jalankan **sql/supply-gambar.sql** SEKALI di Supabase SQL Editor (setelah supply.sql).
2. Admin: Supply & Stock → "Batch Baru" atau tombol ✏️ Ubah / klik kotak foto di kiri nama batch → pilih gambar (JPG/PNG/WebP, otomatis dikompres).
3. Pelanggan melihat etalase: foto produk, nama batch, nama barang, stok, dan tombol pesan. Klik foto untuk memperbesar.
4. Hapus batch → gambar ikut terhapus permanen dari database (cascade). "Hapus Gambar" juga tersedia per batch.

## Update: Admin Melihat Tampilan Pelanggan

1. Jalankan **sql/admin-view.sql** SEKALI di Supabase SQL Editor (setelah supply.sql & perpanjang.sql).
2. Di dashboard admin, tombol **👁 Tampilan Customer** ada di header, tepat di kanan "Lenstore Management". Pilih pelanggan, langsung masuk tanpa login.
3. Di tampilan pelanggan ada bar "Mode Admin": dropdown untuk pindah ke pelanggan lain, dan tombol **← Kembali ke Admin** (PIN admin tetap tersimpan, tidak perlu login ulang).
4. Mode ini LIHAT SAJA (pesan, batal, perpanjang, ubah label, ganti password diblokir). Sesi pelanggan asli tidak terganggu; token lihat berlaku 8 jam.
5. Agar PIN admin terbawa dan dropdown ganti pelanggan aktif, admin dan folder `pelanggan/` harus satu domain (mis. domain.com dan domain.com/pelanggan). Jika subdomain terpisah, PIN akan diminta ulang.

**Jika tombol "Tampilan Customer" menampilkan 404:** alamat portal pelanggan tidak sama dengan `pelanggan/`.
Aplikasi akan otomatis mengecek dan meminta alamat yang benar (tersimpan di browser). Bisa juga diubah lewat tombol
"🔗 Alamat Portal" di daftar pelanggan, atau isi `PORTAL_PELANGGAN_URL` di `config.js`
(mis. `https://pelanggan.domainanda.com/`). Tombol "Kembali ke Admin" tetap berfungsi walau beda domain.

## Update: Tampilan Pelanggan Lebih Ringkas
- Filter daftar langganan: Semua / Sudah Limit / Akan Limit Besok (tombol di atas tabel, atau klik kotak ringkasan).
- Grafik pesanan (per bulan, per dashboard, status aktif) bisa di-minimize; pilihan diingat di browser.
- Daftar langganan aktif pelanggan berbentuk tabel seperti admin (scroll ke samping di HP, kolom Aksi di ujung).
- Kotak ringkasan dibuat minimalis di dashboard pelanggan dan di Dashboard Aktif admin; kotak "Total Hari Terkirim" dan "Total Hari Paket" dihapus dari pelanggan.
- Tema "Biru" kini menjadi Biru Muda (biru langit terang), juga tema bawaan.
Tidak ada SQL baru.

## Update: Pesan Langganan Baru, Katalog, Edit Inline, Link Klik
1. Jalankan **sql/katalog-pesan-baru.sql** SEKALI di Supabase SQL Editor (setelah SQL sebelumnya). Jika sebelumnya sudah menjalankan admin-view.sql, tidak perlu mengulangnya.
2. Pelanggan: tombol **➕ Pesan Langganan Baru** (Beranda dan tab "Pesan & Perpanjang") -> pilih BEM/SEM/LEM, hari, tagar -> Menunggu Konfirmasi. Admin menyetujui di panel "Perpanjangan & Pesanan Baru" pada tab BEM/SEM/LEM; langganan baru masuk Dashboard Aktif.
3. Katalog: Admin -> Supply & Stock -> tab **🛍 Katalog** (Koin / Voucher / Farm), isi nama, gambar, harga (opsional), deskripsi, dan atur Ready / Tidak Ready (tanpa stok). Pelanggan melihat di Supply & Stock -> **Katalog**; item Ready punya tombol Pesan via WhatsApp. Hapus item = gambar ikut terhapus.
4. List-Farm: tombol ✏️ kini mengubah baris langsung di tabel (Enter = simpan, Esc = batal), tanpa pop up.
5. URL (termasuk link grup WhatsApp) di pengumuman, deskripsi katalog, dan catatan admin otomatis menjadi link yang bisa diklik.
6. Tombol "Customer" di header admin dibuat lebih kecil dan minimalis.

## Update: Kategori Katalog Dinamis, Pesan Otomatis WhatsApp/Messenger, Hubungi Admin
1. Jalankan **sql/katalog-kategori.sql** SEKALI di Supabase SQL Editor (setelah katalog-pesan-baru.sql).
2. Admin -> Supply & Stock -> Katalog: tab kategori kini bisa **➕ Kategori**, ✏️ ubah nama/ikon, 🗑 hapus (item di dalamnya ikut terhapus).
3. Pelanggan: pesan katalog, pesanan baru, dan perpanjangan menghasilkan pesan otomatis ke **WhatsApp** (terisi otomatis) atau **Messenger** (pesan disalin, lalu tempel). Alamat ada di `pelanggan/config.js` (ADMIN_WA_INTL, ADMIN_MESSENGER_URL).
4. Tombol **📞 Hubungi Admin** di bagian atas dashboard pelanggan: tulis pesan lalu kirim lewat WhatsApp atau Messenger.

## Update: Pilihan Tampilan Daftar Langganan (Tabel / Box)
Di dashboard pelanggan, di atas daftar langganan ada pilihan **▦ Tabel** (menyamping, seperti admin) dan **▭ Box** (satu kotak per langganan). Pilihan diingat di browser; filter Semua / Sudah Limit / Akan Limit Besok tetap berlaku di kedua mode. Tanpa SQL baru.

## Update: Catatan + Banyak Tagar per Pesanan, Perbaikan Mode Gelap
1. Jalankan **sql/pesan-baru-multi-tagar.sql** SEKALI di Supabase SQL Editor (setelah katalog-pesan-baru.sql).
2. Pesan Langganan Baru: pelanggan menulis beberapa tagar (satu per baris / pisah koma, maks 20) dan catatan untuk admin. Admin SETUJUI -> tiap tagar menjadi 1 data langganan terpisah di Dashboard Aktif, jumlah hari sama. Catatan tampil di panel admin dan ikut ke kolom Keterangan.
3. Mode gelap (tema Hitam): palet dibuat lengkap sehingga semua tulisan terang dan terbaca; header tabel admin ikut tema.

## Update: PRICE (harga paket, istimewa, diskon, kode referal)
1. Jalankan **sql/price.sql** SEKALI di Supabase SQL Editor (setelah pesan-baru-multi-tagar.sql).
2. Admin -> menu baru **💲 PRICE -> Harga & Promo** (PIN admin):
   - Harga Default per Hari untuk BEM / SEM / LEM.
   - Diskon Semua Pelanggan (persen, nama promo, paket yang berlaku). TIDAK berlaku untuk pelanggan istimewa.
   - Pelanggan Istimewa: harga per hari khusus per paket (kosong = pakai default). Harga default tampil dicoret di sisi pelanggan.
   - Kode Referal: potongan persen / nominal, batas pemakaian (kali), masa berlaku opsional, aktif/nonaktif.
3. Pelanggan: harga muncul otomatis di tombol paket dan kotak "Harga" saat Pesan Langganan Baru maupun Perpanjang (harga/hari x hari x jumlah tagar - potongan referal). Total dihitung dan dicatat di SERVER.
4. Jatah kode referal terpakai saat permintaan dikirim, dan dikembalikan jika dibatalkan pelanggan / ditolak admin.
5. Panel permintaan admin menampilkan total, harga per hari (coret bila beda dari default), dan kode referal.

## Update: Referal sekali pakai, Daftar Harga minimize, Tab Bot Order, Dikirim & Arsip
Jalankan 2 SQL ini SEKALI (urutan bebas, keduanya setelah SQL sebelumnya): **sql/referral-sekali.sql** dan **sql/bot-order-kirim-arsip.sql**.
1. Kode referal: tiap pelanggan hanya bisa memakai satu kode 1 kali (batas pemakaian = jumlah pelanggan berbeda). Jika permintaan dibatalkan / ditolak, kode boleh dipakai lagi oleh pelanggan itu. Halaman Price admin menampilkan siapa saja pemakainya (arahkan kursor ke kolom "Terpakai").
2. Dashboard pelanggan: panel "Daftar Harga" bisa di-minimize (klik judulnya); pilihan diingat di browser.
3. Tab **🤖 Bot Order** di samping Beranda (pelanggan) dan menu **🤖 Bot Order** tepat di bawah Dashboard + tombol pintasan di baris tab BEM/SEM/LEM (admin): daftar bot order yang masuk / sudah dibuat, dengan status Menunggu, Disetujui-diproses, Sudah dikirim, Ditolak, dan Arsip.
4. Admin: centang kolom **Dikirim** pada bot order yang sudah disetujui; pelanggan langsung melihat "Sudah dikirim". Tombol **📦 Arsipkan** (per baris atau "arsipkan semua yang terkirim"), filter Arsip, dan **↩ Kembalikan**.
