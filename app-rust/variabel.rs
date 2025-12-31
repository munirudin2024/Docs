fn main() {
//  let x = 5;      
    let mut x = 5; 
    println!("Nilai x adalah: {}", x);
//  x = 5;
    x = 6;
    println!("Sekarang x adalah: {}", x);

// sekarang bermain tipe data
    //Dalam dunia hacking, ini penting banget. 
    //Contohnya: 
    //i32: Angka bulat biasa (Integer 32-bit). Bisa minus, bisa plus. 
    //u32: Angka bulat "Unsigned" (Hanya boleh nol atau positif). Penting untuk nomor Port jaringan (karena tidak ada Port -80)
    let angka_satu: i32 = 100;
    let angka_dua: i32 = 50;
    let hasil = angka_satu + angka_dua;
    println!("Hasil penjumlahan: {}", hasil);
// Eksperimen "Tabrakan Tipe Data"
    let a: i32 = 10;
//  let b: u16 = 5;
    let b: i32 = 5;
    let hasil = a + b;
    println!("a+b={}", hasil);
    println!("Jika {} ditambah {}, maka hasilnya adalah: {}", a, b, hasil);
}
