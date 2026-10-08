# Shadow: plugins
Dipindah dari `src/services/plugins/` pada 2026-10-08 (10 file, 1234 baris). Nol importer aktif.
**Peringatan keamanan:** `PluginSandbox` hanya daftar izin (`canAccess`), BUKAN isolasi nyata; plugin tetap berjalan dengan hak penuh proses (akses env/kunci API). Jangan dipakai memuat kode pihak ketiga tanpa isolasi (vm/worker/proses terpisah).
`pluginLoader` tidak memuat apa pun dari disk. Konsep tetap bernilai untuk strategi trading yang dapat dipasang (sinyal baru tanpa ubah inti), setelah: manifest tervalidasi, izin ditegakkan, loader eksplisit (daftar statis, bukan path dinamis), dan hanya untuk jalur sinyal -- tidak pernah untuk jalur order.
