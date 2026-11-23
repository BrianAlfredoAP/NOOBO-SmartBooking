export interface StockFit {
  jumlah: number;
  tersedia: number;
}

export interface PackageScoreInput {
  jumlah_peserta: number;
  kapasitas: number;
  kondisi: string[];
  stock: StockFit[];
  kebutuhanTerpenuhi: number;
  totalKebutuhan: number;
}

const CONDITION_SCORE: Record<string, number> = {
  'Sangat Baik': 100,
  Baik: 85,
  Cukup: 70,
  Rusak: 0,
};

const WEIGHTS = {
  capacity: 0.4,
  stock: 0.3,
  condition: 0.2,
  completeness: 0.1,
};

export function capacityScore(peserta: number, kapasitas: number): number {
  if (kapasitas <= 0) return 0;
  return round2(Math.min(100, (peserta / kapasitas) * 100));
}

export function stockScore({ jumlah, tersedia }: StockFit): number {
  if (jumlah <= 0) return 100;
  if (tersedia <= 0) return 0;
  return round2(Math.min(100, (jumlah / tersedia) * 100));
}

export function conditionScore(kondisi: string): number {
  return CONDITION_SCORE[kondisi] ?? 60;
}

export function scorePackage(input: PackageScoreInput): number {
  const capacity = capacityScore(input.jumlah_peserta, input.kapasitas);

  const stock = input.stock.length
    ? average(input.stock.map((fit) => stockScore(fit)))
    : 100;

  const condition = input.kondisi.length
    ? average(input.kondisi.map((value) => conditionScore(value)))
    : 100;

  const completeness =
    input.totalKebutuhan > 0
      ? Math.min(100, (input.kebutuhanTerpenuhi / input.totalKebutuhan) * 100)
      : 100;

  return round2(
    capacity * WEIGHTS.capacity +
      stock * WEIGHTS.stock +
      condition * WEIGHTS.condition +
      completeness * WEIGHTS.completeness,
  );
}

function average(values: number[]): number {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
