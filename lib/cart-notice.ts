// Pesan ketika barang di keranjang dikeluarkan karena produknya sudah dihapus
export function unavailableMessage(names: string[]): string {
  if (names.length === 1) {
    return `Produk "${names[0]}" sudah tidak tersedia dan dikeluarkan dari keranjang.`;
  }

  return `${names.length} produk sudah tidak tersedia dan dikeluarkan dari keranjang: ${names.join(", ")}.`;
}
