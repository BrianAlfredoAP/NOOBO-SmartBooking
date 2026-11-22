import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { paginated } from '../common/dto/api-response.dto.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { AturanPeminjaman } from '../entities/workflow/aturan-peminjaman.entity.js';
import type {
  CreateLoanRuleDto,
  LoanRuleQueryDto,
  UpdateLoanRuleDto,
} from './dto/loan-rule.dto.js';
import { LoanRulesRepository } from './loan-rules.repository.js';

@Injectable()
export class LoanRulesService {
  constructor(private readonly repository: LoanRulesRepository) {}

  async findAll(query: LoanRuleQueryDto) {
    const { items, total } = await this.repository.findAll(query);
    return paginated('Daftar aturan peminjaman', items.map((item) => this.toDto(item)), total, query);
  }

  async findOne(id: number) {
    return { message: 'Detail aturan peminjaman', data: this.toDto(await this.require(id)) };
  }

  async create(dto: CreateLoanRuleDto) {
    const rule = new AturanPeminjaman(0, dto.nama_aturan, dto.deskripsi ?? '', dto.ketentuan);
    if (!rule.create()) {
      throw new BusinessException(
        'LOAN_RULE_INVALID',
        'Nama dan ketentuan aturan wajib diisi',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (await this.repository.findByName(dto.nama_aturan)) {
      throw new BusinessException(
        'LOAN_RULE_NAME_TAKEN',
        'Nama aturan sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    const id = await this.repository.create(dto);
    return this.findOne(id);
  }

  async update(id: number, dto: UpdateLoanRuleDto) {
    const rule = await this.require(id);
    if (
      dto.nama_aturan &&
      dto.nama_aturan !== rule.nama_aturan &&
      (await this.repository.findByName(dto.nama_aturan, id))
    ) {
      throw new BusinessException(
        'LOAN_RULE_NAME_TAKEN',
        'Nama aturan sudah digunakan',
        HttpStatus.CONFLICT,
      );
    }
    rule.update(dto);
    await this.repository.update(id, {
      nama_aturan: rule.nama_aturan,
      deskripsi: rule.deskripsi,
      ketentuan: rule.ketentuan,
      aktif: rule.aktif,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    const rule = await this.require(id);
    if (await this.repository.hasActiveRequest(id)) {
      throw new BusinessException(
        'LOAN_RULE_IN_USE',
        'Aturan masih terkait pengajuan aktif',
        HttpStatus.CONFLICT,
      );
    }
    if (rule.aktif) {
      rule.delete();
      await this.repository.update(id, { aktif: false });
    }
    return { message: 'Aturan peminjaman dinonaktifkan' };
  }

  private toDto(rule: AturanPeminjaman) {
    return {
      id_aturan: rule.id_aturan,
      nama_aturan: rule.nama_aturan,
      deskripsi: rule.deskripsi,
      ketentuan: rule.ketentuan,
      aktif: rule.aktif,
    };
  }

  private async require(id: number): Promise<AturanPeminjaman> {
    const rule = await this.repository.findById(id);
    if (!rule) throw new NotFoundException(`Aturan peminjaman ${id} tidak ditemukan`);
    return rule;
  }
}
