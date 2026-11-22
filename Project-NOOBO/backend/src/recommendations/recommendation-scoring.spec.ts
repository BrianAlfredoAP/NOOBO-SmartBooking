import { describe, expect, it } from 'vitest';
import {
  capacityScore,
  conditionScore,
  scorePackage,
  stockScore,
} from './recommendation-scoring.js';

describe('Recommendation scoring', () => {
  it('scores capacity by how close it is to the participant count', () => {
    expect(capacityScore(100, 100)).toBe(100);
    expect(capacityScore(100, 200)).toBe(50);
    expect(capacityScore(100, 50)).toBe(100);
    expect(capacityScore(100, 0)).toBe(0);
  });

  it('scores stock by how tightly it fits the requested quantity', () => {
    expect(stockScore({ jumlah: 2, tersedia: 2 })).toBe(100);
    expect(stockScore({ jumlah: 2, tersedia: 4 })).toBe(50);
    expect(stockScore({ jumlah: 2, tersedia: 0 })).toBe(0);
    expect(stockScore({ jumlah: 0, tersedia: 0 })).toBe(100);
  });

  it('maps facility condition to a stable score', () => {
    expect(conditionScore('Sangat Baik')).toBe(100);
    expect(conditionScore('Baik')).toBe(85);
    expect(conditionScore('Cukup')).toBe(70);
    expect(conditionScore('Rusak')).toBe(0);
    expect(conditionScore('Tidak Diketahui')).toBe(60);
  });

  it('combines capacity, stock, condition and completeness with fixed weights', () => {
    expect(
      scorePackage({
        jumlah_peserta: 100,
        kapasitas: 100,
        kondisi: ['Sangat Baik', 'Baik'],
        stock: [{ jumlah: 2, tersedia: 2 }],
        kebutuhanTerpenuhi: 1,
        totalKebutuhan: 1,
      }),
    ).toBe(98.5);

    expect(
      scorePackage({
        jumlah_peserta: 100,
        kapasitas: 200,
        kondisi: ['Baik', 'Baik'],
        stock: [{ jumlah: 2, tersedia: 4 }],
        kebutuhanTerpenuhi: 1,
        totalKebutuhan: 2,
      }),
    ).toBe(57);
  });

  it('gives full marks when there is nothing extra to satisfy', () => {
    expect(
      scorePackage({
        jumlah_peserta: 50,
        kapasitas: 50,
        kondisi: [],
        stock: [],
        kebutuhanTerpenuhi: 0,
        totalKebutuhan: 0,
      }),
    ).toBe(100);
  });
});
