# Panduan notifikasi kick-off Sabah FC

Fungsi ini menghantar notifikasi telefon untuk **semua perlawanan Super League dan
FA Cup**, mengikut tarikh dan masa **MYT / waktu Malaysia** yang admin terbitkan.
Setiap telefon perlu mengaktifkan notifikasi sekali. Tiada prompt kebenaran ketika
pengguna membuka laman buat kali pertama.

**Status pemasangan:** kod dan ujian disediakan dalam repositori. Penghantaran
latar belakang hanya aktif selepas pemasangan Cloudflare di bawah berjaya. Push
sebenar ke telefon belum diuji sebelum servis dipasang dan telefon didaftarkan.

## 1. Sediakan akses Cloudflare

1. Buka [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens).
2. Pilih **Create Token → Create Custom Token**. Namakan `Sabah FC Notifications`.
3. Berikan kebenaran pada **akaun Sabah FC sahaja**:
   - **Account → Workers Scripts → Edit**: memasang Worker, jadual Cron, Durable
     Object dan kunci push.
   - **Account → Cloudflare Pages → Edit**: menyambung Worker kepada Pages dan
     menerbitkan semula laman.
   - **Account → Account Settings → Read**: pengesanan akaun oleh Wrangler.
4. Pada **Account Resources**, pilih akaun yang mengandungi projek Pages `sabah-fc`.
   Token ini tidak memerlukan akses DNS atau polisi Cloudflare Access.
5. Salin token. Di Cloudflare **Workers & Pages → Overview**, salin juga
   **Account ID** (32 aksara). Account ID bukan nama projek atau Zone ID.

Simpan token di GitHub sahaja pada langkah seterusnya. Jangan masukkan token dalam
chat, fail JSON portal, kod frontend atau Variables yang boleh dibaca pelayar.

## 2. Masukkan GitHub Secrets

Buka [sabah-fc → Settings → Secrets and variables → Actions](https://github.com/KHAN7-gif/sabah-fc/settings/secrets/actions).
Pilih **New repository secret**, kemudian tambah:

| Name | Secret |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Token yang dicipta pada langkah 1 |
| `CLOUDFLARE_ACCOUNT_ID` | Pilihan: Account ID projek Pages Sabah FC |

Jika token terhad kepada **satu akaun**, pemasang mengesan Account ID secara
automatik: anda hanya perlu memasukkan `CLOUDFLARE_API_TOKEN`. Jika token mempunyai
akses kepada beberapa akaun, isi `CLOUDFLARE_ACCOUNT_ID` juga.

Tetapan penerbitan admin sedia ada (`GITHUB_PUBLISH_TOKEN`, `CF_ACCESS_TEAM_DOMAIN`,
`CF_ACCESS_AUD`, `ADMIN_EMAILS`) kekal pada Pages. Secret pemasangan ini untuk
pemasangan servis push melalui GitHub Actions.

## 3. Jalankan pemasangan

1. Buka [Actions → Install kickoff notifications](https://github.com/KHAN7-gif/sabah-fc/actions/workflows/deploy-notifications.yml).
2. Pilih **Run workflow → main → Run workflow**.
3. Tunggu sehingga semua langkah berwarna hijau. Pemasang akan:
   - Memasang Worker `sabah-fc-notifications`.
   - Mencipta Durable Object untuk menyimpan langganan dan rekod penghantaran.
   - Menjana kunci Web Push dan menyimpannya sebagai Worker Secrets.
   - Memasang Cron `* * * * *` untuk menyemak jadual setiap minit.
   - Menambah Service binding **`NOTIFICATIONS`** kepada Pages `sabah-fc`.
   - Menerbitkan semula Pages agar binding baharu aktif dan menyemak endpoint status.
4. Buka [status servis notifikasi](https://sabah-fc.pages.dev/api/notifications/config).
   Pemasangan siap apabila respons mengandungi **`"available": true`** dan
   `publicKey`. Kunci awam ini memang boleh dibaca; kunci peribadi kekal di Worker.

Pemasang mengekalkan kunci push sedia ada apabila dijalankan semula. Jangan padam
atau tukar pasangan `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY` sesuka hati: telefon
yang telah melanggan bergantung pada pasangan asal itu.

Jika workflow gagal, semak mesej pada langkah pemasangan dan kebenaran token.
Pastikan projek `sabah-fc` sudah mempunyai deployment produksi yang berjaya.
Service binding menghubungkan Worker secara dalaman; URL awam Worker tidak diperlukan.

## 4. Aktifkan pada telefon

**Android (Chrome):**

1. Buka [Sabah FC](https://sabah-fc.pages.dev/).
2. Tekan ikon **loceng / Notifikasi** di bahagian atas.
3. Tekan **Aktifkan notifikasi**, kemudian **Allow / Benarkan**.
4. Pastikan panel menunjukkan **Notifikasi kick-off aktif**.

Pemasangan ke Skrin Utama adalah pilihan pada Android. Notifikasi boleh diterima
ketika tab ditutup, tertakluk pada sokongan pelayar dan tetapan telefon.

**iPhone / iPad (iOS/iPadOS 16.4 atau lebih baharu):**

1. Buka laman melalui **Safari**.
2. Tekan **Kongsi → Tambah ke Skrin Utama**.
3. Buka **Sabah FC** daripada ikon Skrin Utama.
4. Tekan **Notifikasi → Aktifkan notifikasi → Benarkan**.

Pada iPhone, tab Safari biasa belum mencukupi untuk Web Push; buka webapp daripada
Skrin Utama. Setiap telefon atau pelayar perlu diaktifkan secara berasingan.
**Matikan notifikasi** dalam panel yang sama untuk berhenti melanggan.

GitHub Pages turut disokong: ia menggunakan servis push Cloudflare yang sama dan
notifikasi membuka perlawanan pada laman yang digunakan ketika melanggan.
Aplikasi APK TV ialah WebView dan tidak menawarkan push telefon ini.

## 5. Tetapkan kick-off sebagai admin

1. Buka **Matches → Edit Perlawanan**.
2. Tetapkan **Tarikh**, **Masa MYT** dan status **PREVIEW**. **LIVE** juga layak
   menerima notifikasi sekitar masa kick-off. Masa kosong bermaksud belum disahkan.
3. Tekan **Simpan Perlawanan** dan pastikan penerbitan admin berjaya mencipta commit
   GitHub. **Simpanan tempatan sahaja tidak mengemas kini jadual push.**
4. Servis membaca data diterbitkan yang terkini daripada `published-data.json` di
   GitHub setiap minit. Tarikh dan masa admin mengatasi jadual asal portal.
5. Jika perlawanan ditunda, pilih **POSTPONED** atau ubah tarikh/masa dan terbitkan
   perubahan sebelum masa lama tiba.

Notifikasi dihantar sekitar kick-off, biasanya dalam sela semakan satu minit.
Ia tidak memerlukan webapp terbuka. Sambungan internet, kuasa bateri, Focus / Do
Not Disturb dan servis push telefon boleh menangguhkan atau menyekat penghantaran;
ia bukan jaminan tepat pada saat sifar. Notifikasi yang tidak dihantar dalam tetingkap
2 minit tidak dikejar berjam-jam kemudian. TTL penghantaran ialah 120 saat.

Perlawanan **FULL TIME**, **POSTPONED**, masa/tarikh tidak sah atau belum ditetapkan
akan diabaikan. Rekod penghantaran mengelakkan ulang pada semakan berikutnya.
Langganan selepas kick-off tidak menerima notifikasi lampau. Satu notifikasi
membuka terus detail perlawanan berkaitan. Jika masa ditukar selepas notifikasi
lama sudah tiba, notifikasi baharu boleh dihantar pada kick-off baharu.

## Ujian telefon selepas pemasangan

1. Daftar satu telefon mengikut langkah 4.
2. Sebagai admin, buat sementara satu perlawanan **PREVIEW** dengan tarikh hari ini
   dan masa MYT sekitar 3–5 minit dari sekarang; terbitkan perubahan.
3. Tutup webapp. Pada masa kick-off, pastikan telefon menerima satu notifikasi dan
   tekan notifikasi itu untuk membuka perlawanan yang betul.
4. Semak bahawa minit berikutnya tidak menghantar notifikasi sama berulang.
5. Pulihkan jadual rasmi dan terbitkan semula. Gunakan tetapan **Matikan notifikasi**
   untuk menguji berhenti melanggan.

Data ujian tidak dicipta secara automatik dalam jadual awam.

## Nota teknikal dan privasi

- Push menggunakan enkripsi **RFC 8291 aes128gcm** dan tandatangan **VAPID ES256**.
- Endpoint dan kunci langganan telefon disimpan dalam Durable Object, bukan dalam
  repositori atau `published-data.json`. Tiada nombor telefon diperlukan.
- API tidak menyenaraikan langganan dan menerima langganan hanya untuk endpoint
  servis push pelayar yang dibenarkan. Had percubaan ialah 10/minit bagi alamat IP.
- Pengguna boleh berhenti melanggan; endpoint yang dipulangkan sebagai 404/410 oleh
  servis push dibuang. ID penghantaran lama dipangkas selepas tujuh hari apabila
  penghantaran seterusnya berlaku. Had langganan semasa ialah 5,000 per servis.
- Service worker mengurus push dan klik sahaja; ia tidak menyimpan HTML atau JSON
  portal dalam cache. Mekanisme auto-refresh data telefon sedia ada dikekalkan.
- Kegagalan mendapatkan jadual terkini tidak menggunakan jadual cache lama untuk
  menghantar notifikasi yang mungkin telah ditunda.

## Pengesahan pembangunan

```sh
node tests/notifications.test.mjs
python3 tests/notifications-browser.py
npx --yes wrangler@4.47.0 deploy --dry-run --config notifications/wrangler.jsonc
npx --yes wrangler@4.47.0 pages functions build functions --outdir /tmp/sabah-functions-build
```

Ujian meliputi masa MYT, kedua-dua liga, pertukaran jadual, rekod penghantaran,
langganan tamat, enkripsi yang dinyahsulit menggunakan implementasi HKDF Node yang
berasingan, tandatangan VAPID, origin/CORS, pautan perlawanan kedua-dua domain,
service worker dan aliran UI. Langganan push dalam ujian pelayar disimulasikan;
penghantaran sebenar memerlukan pemasangan Cloudflare dan telefon sebenar.

## Jika pemasangan diuruskan melalui pembantu

Token juga boleh dimasukkan pada medan **Secrets → CLOUDFLARE_API_TOKEN** dalam
tetapan persekitaran Codex yang disediakan untuk sesi ini. Semak dan simpan
perubahan, kemudian pilih **Publish** untuk mengaktifkan konfigurasi. Draf sahaja
belum memberikan akses. Account ID dikesan secara automatik jika hanya satu akaun
dibenarkan oleh token. Pembantu boleh menjalankan pemasang dari persekitaran itu;
anda tidak perlu menjalankan workflow GitHub sendiri. Jangan masukkan token dalam
chat. GitHub Secrets hanya diperlukan jika anda memilih pemasangan melalui Actions.
