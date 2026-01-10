using System;
using System. IO;

namespace CyberSecurityApp
{
    class Program
    {
        // Array 1 dimensi
        static string[] savedPasswords = new string[100];
        static string[] savedUsernames = new string[100];
        static string[] savedNamaAkun = new string[100];
        static int passwordCount = 0;

        // Array 2 dimensi - log aktivitas
        static string[,] activityLog = new string[100, 3];
        static int logCount = 0;

        static string[] strengthLevels = { "Sangat Lemah", "Lemah", "Sedang", "Kuat", "Sangat Kuat" };

        // Konstanta lebar box (akan menyesuaikan dengan layar)
        static int boxWidth = 80; // Default, akan diupdate di Main()

        // Path file penyimpanan (di folder "data" dalam project)
        static string dataFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "data");
        static string passwordFile = Path.Combine(dataFolder, "passwords.dat");
        static string logFile = Path.Combine(dataFolder, "activity_log.dat");

        static void Main(string[] args)
        {
            // Set lebar box berdasarkan lebar konsol (maksimal 100, minimal 60)
            int consoleWidth = Console.WindowWidth;
            boxWidth = consoleWidth > 100 ? 100 : (consoleWidth < 60 ? 60 : consoleWidth - 4);

            DrawBoxTop("CYBER SECURITY - PASSWORD MANAGER & ANALYZER");
            CenterText("Oleh: Muhammad Munirudin");
            DrawBoxBottom();

            // Load data saat program mulai
            InitializeDataFolder();
            LoadAllData();

            Console.WriteLine($"Data disimpan di: {dataFolder}");
            Console.WriteLine($"{passwordCount} password & {logCount} aktivitas dimuat...\n");

            bool running = true;
            while (running)
            {
                TampilkanMenu();
                Console.Write("\nPilih menu (1-8): ");
                string pilihan = Console.ReadLine() ?? "";

                switch (pilihan)
                {
                    case "1":  CekKekuatanPassword(); break;
                    case "2": GeneratePassword(); break;
                    case "3": SimpanPassword(); break;
                    case "4": LihatSemuaPassword(); break;
                    case "5": CariDanGunakanPassword(); break;
                    case "6": HapusPassword(); break;
                    case "7": LihatLogAktivitas(); break;
                    case "8": 
                        running = false;
                        Console.WriteLine("\n✅ Data sudah tersimpan otomatis.");
                        Console.WriteLine("Terima kasih telah menggunakan aplikasi ini!");
                        break;
                    default:
                        Console.WriteLine("\n⚠ Pilihan tidak valid!");
                        break;
                }
            }
        }

        // ===================== FILE MANAGEMENT =====================

        // Buat folder data jika belum ada
        static void InitializeDataFolder()
        {
            if (! Directory.Exists(dataFolder))
            {
                Directory.CreateDirectory(dataFolder);
                Console.WriteLine("📁 Folder data berhasil dibuat.");
            }
        }

        // Load semua data dari file
        static void LoadAllData()
        {
            LoadPasswords();
            LoadLogs();
        }

        // Load password dari file
        static void LoadPasswords()
        {
            if (! File.Exists(passwordFile)) return;

            try
            {
                string[] lines = File. ReadAllLines(passwordFile);
                passwordCount = 0;

                foreach (string line in lines)
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    string[] parts = line.Split('|');
                    if (parts.Length == 3)
                    {
                        savedNamaAkun[passwordCount] = DecryptData(parts[0]);
                        savedUsernames[passwordCount] = DecryptData(parts[1]);
                        savedPasswords[passwordCount] = parts[2]; // Password sudah terenkripsi
                        passwordCount++;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠ Gagal load password: {ex.Message}");
            }
        }

        // Simpan password ke file (AUTO SAVE)
        static void SavePasswords()
        {
            try
            {
                string[] lines = new string[passwordCount];

                for (int i = 0; i < passwordCount; i++)
                {
                    // Format: NamaAkun|Username|EncryptedPassword
                    lines[i] = $"{EncryptData(savedNamaAkun[i])}|{EncryptData(savedUsernames[i])}|{savedPasswords[i]}";
                }

                File.WriteAllLines(passwordFile, lines);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠ Gagal menyimpan password: {ex. Message}");
            }
        }

        // Load log dari file
        static void LoadLogs()
        {
            if (! File.Exists(logFile)) return;

            try
            {
                string[] lines = File. ReadAllLines(logFile);
                logCount = 0;

                foreach (string line in lines)
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    string[] parts = line.Split('|');
                    if (parts.Length == 3)
                    {
                        activityLog[logCount, 0] = parts[0]; // Waktu
                        activityLog[logCount, 1] = parts[1]; // Aksi
                        activityLog[logCount, 2] = parts[2]; // Status
                        logCount++;
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠ Gagal load log: {ex.Message}");
            }
        }

        // Simpan log ke file (AUTO SAVE)
        static void SaveLogs()
        {
            try
            {
                string[] lines = new string[logCount];

                for (int i = 0; i < logCount; i++)
                {
                    lines[i] = $"{activityLog[i, 0]}|{activityLog[i, 1]}|{activityLog[i, 2]}";
                }

                File.WriteAllLines(logFile, lines);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"⚠ Gagal menyimpan log: {ex.Message}");
            }
        }

        // Enkripsi data untuk file (bukan password)
        static string EncryptData(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            char[] encrypted = new char[text.Length];
            for (int i = 0; i < text.Length; i++)
                encrypted[i] = (char)(text[i] + 5);
            return new string(encrypted);
        }

        // Dekripsi data dari file
        static string DecryptData(string text)
        {
            if (string.IsNullOrEmpty(text)) return "";
            char[] decrypted = new char[text.Length];
            for (int i = 0; i < text.Length; i++)
                decrypted[i] = (char)(text[i] - 5);
            return new string(decrypted);
        }

        // ===================== MENU =====================

        static void TampilkanMenu()
        {
            Console.WriteLine("\n┌" + new string('─', boxWidth - 2) + "┐");
            CenterText("MENU UTAMA");
            DrawLine();
            PrintBoxLine("1. Cek Password");
            PrintBoxLine("2. Generate Password");
            PrintBoxLine("3. Simpan Password Baru");
            PrintBoxLine("4. Lihat Semua Password");
            PrintBoxLine("5. Gunakan Password");
            PrintBoxLine("6. Hapus Password");
            PrintBoxLine("7. Lihat Aktivitas");
            PrintBoxLine("8. Keluar");
            DrawLine();
            PrintBoxLine($"Auto-save: ON  |   {passwordCount} password tersimpan");
            Console.WriteLine("└" + new string('─', boxWidth - 2) + "┘");
        }

        // ===================== FITUR SIMPAN PASSWORD =====================
        static void SimpanPassword()
        {
            if (passwordCount >= savedPasswords.Length)
            {
                Console.WriteLine("\n⚠ Penyimpanan penuh! Maksimal 100 password.");
                return;
            }

            Console.WriteLine("\n┌" + new string('─', boxWidth - 2) + "┐");
            CenterText("SIMPAN PASSWORD BARU");
            DrawLine();
            Console.Write("  Nama Layanan (misal: Gmail, IG): ");
            string namaAkun = Console.ReadLine() ?? "";

            Console.Write("  Username/Email: ");
            string username = Console.ReadLine() ?? "";

            Console.Write("  Password: ");
            string password = Console.ReadLine() ?? "";

            // Validasi input
            if (string.IsNullOrWhiteSpace(namaAkun) || string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                Console.WriteLine("\n  ⚠ Semua field harus diisi!");
                return;
            }

            // Cek kekuatan
            int skor = HitungSkorPassword(password);
            Console.WriteLine($"\n  Kekuatan password: {GetStrengthLevel(skor)} ({skor}/5)");

            if (skor < 3)
            {
                Console.Write("  Password lemah.  Tetap simpan? (y/n): ");
                string konfirmasi = Console.ReadLine() ?? "";
                if (konfirmasi.ToLower() != "y")
                {
                    Console.WriteLine("  Batal menyimpan.");
                    return;
                }
            }

            // Simpan ke array
            savedNamaAkun[passwordCount] = namaAkun;
            savedUsernames[passwordCount] = username;
            savedPasswords[passwordCount] = EncryptPassword(password);
            passwordCount++;

            // AUTO SAVE ke file
            SavePasswords();

            PrintEmptyLine();
            PrintBoxLine("✅ Password berhasil disimpan!");
            PrintBoxLine("💾 Data otomatis tersimpan ke file.");
            Console.WriteLine("└" + new string('─', boxWidth - 2) + "┘");

            TambahLog("Simpan Password", namaAkun);
        }

        // ===================== FITUR LIHAT SEMUA PASSWORD =====================
        static void LihatSemuaPassword()
        {
            if (passwordCount == 0)
            {
                Console.WriteLine("\n⚠ Belum ada password yang tersimpan.");
                return;
            }

            // Sorting berdasarkan nama akun (Bubble Sort)
            string[] sortedNama = new string[passwordCount];
            string[] sortedUser = new string[passwordCount];
            string[] sortedPass = new string[passwordCount];

            for (int i = 0; i < passwordCount; i++)
            {
                sortedNama[i] = savedNamaAkun[i];
                sortedUser[i] = savedUsernames[i];
                sortedPass[i] = savedPasswords[i];
            }

            // Bubble Sort
            for (int i = 0; i < passwordCount - 1; i++)
            {
                for (int j = 0; j < passwordCount - i - 1; j++)
                {
                    if (string.Compare(sortedNama[j], sortedNama[j + 1], true) > 0)
                    {
                        string temp = sortedNama[j];
                        sortedNama[j] = sortedNama[j + 1];
                        sortedNama[j + 1] = temp;

                        temp = sortedUser[j];
                        sortedUser[j] = sortedUser[j + 1];
                        sortedUser[j + 1] = temp;

                        temp = sortedPass[j];
                        sortedPass[j] = sortedPass[j + 1];
                        sortedPass[j + 1] = temp;
                    }
                }
            }

            DrawBoxTop("PASSWORD TERSIMPAN");
            DrawBoxMiddle();
            
            // Header tabel
            int colWidth1 = 5;  // No
            int colWidth2 = 20; // Layanan
            int colWidth3 = 25; // Username
            int colWidth4 = boxWidth - colWidth1 - colWidth2 - colWidth3 - 5; // Password (sisa)
            
            string header = "  " + "No".PadRight(colWidth1) + "Layanan".PadRight(colWidth2) + "Username".PadRight(colWidth3) + "Password".PadRight(colWidth4);
            PrintBoxLine(header.TrimEnd(), 0);
            string separator = "  " + "──".PadRight(colWidth1) + "───────".PadRight(colWidth2) + "────────".PadRight(colWidth3) + "────────".PadRight(colWidth4);
            PrintBoxLine(separator.TrimEnd(), 0);

            for (int i = 0; i < passwordCount; i++)
            {
                string decrypted = DecryptPassword(sortedPass[i]);
                string no = $"{i + 1}.";
                string nama = sortedNama[i].Length > colWidth2 - 1 ? sortedNama[i].Substring(0, colWidth2 - 4) + "..." : sortedNama[i];
                string user = sortedUser[i].Length > colWidth3 - 1 ? sortedUser[i].Substring(0, colWidth3 - 4) + "..." : sortedUser[i];
                string pass = MaskPassword(decrypted);
                
                string row = "  " + no.PadRight(colWidth1) + nama.PadRight(colWidth2) + user.PadRight(colWidth3) + pass.PadRight(colWidth4);
                PrintBoxLine(row.TrimEnd(), 0);
            }

            DrawBoxMiddle();
            PrintBoxLine("Password disensor untuk keamanan.");
            PrintBoxLine("Gunakan menu '5' untuk melihat password lengkap.");
            DrawBoxBottom();

            TambahLog("Lihat Daftar", $"{passwordCount} password");
        }

        // ===================== FITUR CARI & GUNAKAN PASSWORD =====================
        static void CariDanGunakanPassword()
        {
            if (passwordCount == 0)
            {
                Console.WriteLine("\n⚠ Belum ada password yang tersimpan.");
                return;
            }

            Console.WriteLine("\n┌" + new string('─', boxWidth - 2) + "┐");
            CenterText("CARI & GUNAKAN PASSWORD");
            DrawLine();
            Console.Write("  Masukkan nama layanan yang dicari: ");
            string cari = (Console.ReadLine() ?? "").ToLower();

            // Cari di array
            int[] hasilIndex = new int[100];
            int jumlahHasil = 0;

            for (int i = 0; i < passwordCount; i++)
            {
                if (savedNamaAkun[i].ToLower().Contains(cari))
                {
                    hasilIndex[jumlahHasil] = i;
                    jumlahHasil++;
                }
            }

            if (jumlahHasil == 0)
            {
                Console.WriteLine($"\n  ❌ Tidak ditemukan password untuk '{cari}'");
                Console.WriteLine("└" + new string('─', boxWidth - 2) + "┘");
                return;
            }

            Console.WriteLine($"\n  Ditemukan {jumlahHasil} hasil:\n");

            for (int i = 0; i < jumlahHasil; i++)
            {
                int idx = hasilIndex[i];
                Console.WriteLine($"  [{i + 1}] {savedNamaAkun[idx]} - {savedUsernames[idx]}");
            }

            Console.Write("\n  Pilih nomor untuk melihat password (0 = batal): ");
            int pilih;
            if (! int.TryParse(Console.ReadLine(), out pilih) || pilih < 1 || pilih > jumlahHasil)
            {
                Console.WriteLine("  Dibatalkan.");
                return;
            }

            int selectedIdx = hasilIndex[pilih - 1];
            string passwordAsli = DecryptPassword(savedPasswords[selectedIdx]);

            DrawBoxTop("DETAIL PASSWORD");
            DrawBoxMiddle();
            PrintBoxLine(FormatField("Layanan", savedNamaAkun[selectedIdx]));
            PrintBoxLine(FormatField("Username", savedUsernames[selectedIdx]));
            PrintBoxLine(FormatField("Password", passwordAsli));
            DrawBoxMiddle();
            PrintBoxLine("Silakan copy!");
            PrintBoxLine("⚠  Jangan share!");
            DrawBoxBottom();

            Console.WriteLine("\n  [Tekan Enter...]");
            Console.ReadLine();
            Console.WriteLine("\n  ✅ Password sudah disembunyikan.\n");

            TambahLog("Ambil Password", savedNamaAkun[selectedIdx]);
        }

        // ===================== FITUR HAPUS PASSWORD =====================
        static void HapusPassword()
        {
            if (passwordCount == 0)
            {
                Console.WriteLine("\n⚠ Belum ada password yang tersimpan.");
                return;
            }

            Console.WriteLine("\n┌" + new string('─', boxWidth - 2) + "┐");
            CenterText("HAPUS PASSWORD");
            DrawLine();

            for (int i = 0; i < passwordCount; i++)
            {
                Console.WriteLine($"  [{i + 1}] {savedNamaAkun[i]} - {savedUsernames[i]}");
            }

            Console. Write("\n  Pilih nomor yang akan dihapus (0 = batal): ");
            int pilih;
            if (!int. TryParse(Console.ReadLine(), out pilih) || pilih < 1 || pilih > passwordCount)
            {
                Console.WriteLine("  Dibatalkan.");
                return;
            }

            string namaYangDihapus = savedNamaAkun[pilih - 1];

            Console.Write($"  Yakin hapus password {namaYangDihapus}? (y/n): ");
            string konfirmasi = Console.ReadLine() ?? "";
            if (konfirmasi.ToLower() != "y")
            {
                Console.WriteLine("  Dibatalkan.");
                return;
            }

            // Geser array ke kiri
            for (int i = pilih - 1; i < passwordCount - 1; i++)
            {
                savedNamaAkun[i] = savedNamaAkun[i + 1];
                savedUsernames[i] = savedUsernames[i + 1];
                savedPasswords[i] = savedPasswords[i + 1];
            }
            passwordCount--;

            // AUTO SAVE ke file
            SavePasswords();

            PrintEmptyLine();
            PrintBoxLine("✅ Password berhasil dihapus!");
            PrintBoxLine("💾 Perubahan otomatis tersimpan.");
            Console.WriteLine("└" + new string('─', boxWidth - 2) + "┘");

            TambahLog("Hapus Password", namaYangDihapus);
        }

        // ===================== FITUR CEK KEKUATAN PASSWORD =====================
        static void CekKekuatanPassword()
        {
            Console.Write("\nMasukkan password yang ingin dicek: ");
            string password = Console.ReadLine() ?? "";

            if (string.IsNullOrWhiteSpace(password))
            {
                Console.WriteLine("\n⚠ Password tidak boleh kosong!");
                return;
            }

            int score = HitungSkorPassword(password);
            string level = GetStrengthLevel(score);
            string[] saran = GetSaranPassword(password);

            DrawBoxTop("HASIL ANALISIS PASSWORD");
            DrawBoxMiddle();
            PrintBoxLine(FormatField("Password", MaskPassword(password)));
            PrintBoxLine(FormatField("Panjang", password.Length.ToString()));
            PrintBoxLine(FormatField("Skor", $"{score}/5"));
            PrintBoxLine(FormatField("Kekuatan", level));
            DrawBoxMiddle();
            PrintBoxLine("SARAN PERBAIKAN:");

            SortSaran(saran);

            bool adaSaran = false;
            for (int i = 0; i < saran.Length; i++)
            {
                if (! string.IsNullOrEmpty(saran[i]))
                {
                    PrintBoxLine($"• {saran[i]}");
                    adaSaran = true;
                }
            }

            if (!adaSaran)
                PrintBoxLine("✅ Password sudah sangat kuat!");

            DrawBoxBottom();

            TambahLog("Cek Password", level);
        }

        // ===================== FITUR GENERATE PASSWORD =====================
        static void GeneratePassword()
        {
            Console.Write("\nMasukkan panjang password (min 8, default 12): ");
            int panjang;
            if (!int.TryParse(Console.ReadLine(), out panjang) || panjang < 8)
                panjang = 12;

            string password = GenerateSecurePassword(panjang);
            int score = HitungSkorPassword(password);

            DrawBoxTop("PASSWORD YANG DIGENERATE");
            DrawBoxMiddle();
            PrintBoxLine(FormatField("Password", password));
            PrintBoxLine(FormatField("Panjang", $"{password.Length} karakter"));
            PrintBoxLine(FormatField("Kekuatan", $"{GetStrengthLevel(score)} ({score}/5)"));
            DrawBoxMiddle();
            PrintBoxLine("Copy lalu simpan dengan menu '3'");
            DrawBoxBottom();

            TambahLog("Generate Password", "Berhasil");
        }

        // ===================== HELPER FUNCTIONS =====================

        static int HitungSkorPassword(string password)
        {
            int score = 0;
            if (password.Length >= 8) score++;
            if (MengandungHurufBesar(password)) score++;
            if (MengandungHurufKecil(password)) score++;
            if (MengandungAngka(password)) score++;
            if (MengandungKarakterSpesial(password)) score++;
            return score;
        }

        static bool MengandungHurufBesar(string text)
        {
            foreach (char c in text)
                if (c >= 'A' && c <= 'Z') return true;
            return false;
        }

        static bool MengandungHurufKecil(string text)
        {
            foreach (char c in text)
                if (c >= 'a' && c <= 'z') return true;
            return false;
        }

        static bool MengandungAngka(string text)
        {
            foreach (char c in text)
                if (c >= '0' && c <= '9') return true;
            return false;
        }

        static bool MengandungKarakterSpesial(string text)
        {
            string spesial = "!@#$%^&*()_+-=[]{}|;: ,.<>?";
            foreach (char c in text)
                if (spesial.Contains(c. ToString())) return true;
            return false;
        }

        static string GetStrengthLevel(int score)
        {
            if (score >= 0 && score < strengthLevels.Length)
                return strengthLevels[score];
            return "Unknown";
        }

        static string[] GetSaranPassword(string password)
        {
            string[] saran = new string[5];
            int idx = 0;

            if (password.Length < 8)
                saran[idx++] = "[TINGGI] Tambah panjang minimal 8 karakter";
            if (! MengandungHurufBesar(password))
                saran[idx++] = "[SEDANG] Tambahkan huruf besar (A-Z)";
            if (!MengandungHurufKecil(password))
                saran[idx++] = "[SEDANG] Tambahkan huruf kecil (a-z)";
            if (!MengandungAngka(password))
                saran[idx++] = "[SEDANG] Tambahkan angka (0-9)";
            if (!MengandungKarakterSpesial(password))
                saran[idx++] = "[TINGGI] Tambahkan karakter spesial (! @#$%^&*)";

            return saran;
        }

        static void SortSaran(string[] arr)
        {
            int n = arr.Length;
            for (int i = 0; i < n - 1; i++)
            {
                for (int j = 0; j < n - i - 1; j++)
                {
                    if (! string.IsNullOrEmpty(arr[j]) && !string.IsNullOrEmpty(arr[j + 1]))
                    {
                        if (! arr[j].Contains("TINGGI") && arr[j + 1].Contains("TINGGI"))
                        {
                            string temp = arr[j];
                            arr[j] = arr[j + 1];
                            arr[j + 1] = temp;
                        }
                    }
                }
            }
        }

        static string GenerateSecurePassword(int length)
        {
            string hurufBesar = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            string hurufKecil = "abcdefghijklmnopqrstuvwxyz";
            string angka = "0123456789";
            string spesial = "!@#$%^&*";
            string semua = hurufBesar + hurufKecil + angka + spesial;

            Random random = new Random();
            char[] password = new char[length];

            password[0] = hurufBesar[random.Next(hurufBesar.Length)];
            password[1] = hurufKecil[random.Next(hurufKecil.Length)];
            password[2] = angka[random.Next(angka. Length)];
            password[3] = spesial[random. Next(spesial.Length)];

            for (int i = 4; i < length; i++)
                password[i] = semua[random.Next(semua.Length)];

            // Shuffle
            for (int i = length - 1; i > 0; i--)
            {
                int j = random.Next(i + 1);
                char temp = password[i];
                password[i] = password[j];
                password[j] = temp;
            }

            return new string(password);
        }

        static string EncryptPassword(string password)
        {
            char[] encrypted = new char[password.Length];
            for (int i = 0; i < password.Length; i++)
                encrypted[i] = (char)(password[i] + 3);
            return new string(encrypted);
        }

        static string DecryptPassword(string encrypted)
        {
            char[] decrypted = new char[encrypted.Length];
            for (int i = 0; i < encrypted.Length; i++)
                decrypted[i] = (char)(encrypted[i] - 3);
            return new string(decrypted);
        }

        // ===================== HELPER FUNCTIONS UNTUK BORDER DINAMIS =====================
        
        // Gambar garis atas box dengan title
        static void DrawBoxTop(string title = "")
        {
            Console.WriteLine("╔" + new string('═', boxWidth - 2) + "╗");
            if (!string.IsNullOrEmpty(title))
            {
                CenterText(title);
            }
        }

        // Gambar garis tengah box (separator)
        static void DrawBoxMiddle()
        {
            Console.WriteLine("╠" + new string('═', boxWidth - 2) + "╣");
        }

        // Gambar garis bawah box
        static void DrawBoxBottom()
        {
            Console.WriteLine("╚" + new string('═', boxWidth - 2) + "╝");
        }

        // Gambar garis horizontal sederhana
        static void DrawLine()
        {
            Console.WriteLine("├" + new string('─', boxWidth - 2) + "┤");
        }

        // Cetak teks di tengah box
        static void CenterText(string text)
        {
            int padding = (boxWidth - 2 - text.Length) / 2;
            string paddedText = new string(' ', padding) + text;
            Console.WriteLine("║" + paddedText.PadRight(boxWidth - 2) + "║");
        }

        // Cetak baris di dalam box dengan padding
        static void PrintBoxLine(string text, int leftPadding = 2)
        {
            string content = new string(' ', leftPadding) + text;
            Console.WriteLine("║" + content.PadRight(boxWidth - 2) + "║");
        }

        // Cetak baris kosong di dalam box
        static void PrintEmptyLine()
        {
            Console.WriteLine("║" + new string(' ', boxWidth - 2) + "║");
        }

        // Format field dengan label dan value
        static string FormatField(string label, string value)
        {
            int availableSpace = boxWidth - 8 - label.Length; // 8 = padding + border
            if (value.Length > availableSpace)
            {
                value = value.Substring(0, availableSpace - 3) + "...";
            }
            return $"  {label}: {value}";
        }

        static string MaskPassword(string password)
        {
            if (password.Length <= 2) return "**";
            return password[0] + new string('*', password.Length - 2) + password[password. Length - 1];
        }

        static void TambahLog(string aksi, string status)
        {
            if (logCount < 100)
            {
                activityLog[logCount, 0] = DateTime.Now. ToString("yyyy-MM-dd HH:mm:ss");
                activityLog[logCount, 1] = aksi;
                activityLog[logCount, 2] = status;
                logCount++;

                // AUTO SAVE log
                SaveLogs();
            }
        }

        static void LihatLogAktivitas()
        {
            if (logCount == 0)
            {
                Console.WriteLine("\n⚠ Belum ada aktivitas yang tercatat.");
                return;
            }

            DrawBoxTop("LOG AKTIVITAS");
            DrawBoxMiddle();
            
            // Header tabel
            int colWaktu = 20;
            int colAksi = 20;
            int colStatus = boxWidth - colWaktu - colAksi - 5;
            
            string header = "  " + "Waktu".PadRight(colWaktu) + "Aksi".PadRight(colAksi) + "Status".PadRight(colStatus);
            PrintBoxLine(header.TrimEnd(), 0);
            string separator = "  " + "─────".PadRight(colWaktu) + "────".PadRight(colAksi) + "──────".PadRight(colStatus);
            PrintBoxLine(separator.TrimEnd(), 0);

            // Tampilkan 20 log terakhir
            int start = logCount > 20 ? logCount - 20 : 0;
            for (int i = start; i < logCount; i++)
            {
                string waktu = activityLog[i, 0];
                string aksi = activityLog[i, 1].Length > colAksi - 1 ? activityLog[i, 1].Substring(0, colAksi - 4) + "..." : activityLog[i, 1];
                string status = activityLog[i, 2].Length > colStatus - 1 ? activityLog[i, 2].Substring(0, colStatus - 4) + "..." : activityLog[i, 2];
                
                string row = "  " + waktu.PadRight(colWaktu) + aksi.PadRight(colAksi) + status.PadRight(colStatus);
                PrintBoxLine(row.TrimEnd(), 0);
            }

            DrawBoxMiddle();
            PrintBoxLine($"Total: {logCount} log aktivitas");
            DrawBoxBottom();
        }
    }
}