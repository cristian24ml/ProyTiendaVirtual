import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LogAcceso } from './entities/log-acceso.entity';

@Injectable()
export class LogAccesoService {
  constructor(
    @InjectRepository(LogAcceso)
    private readonly logRepo: Repository<LogAcceso>,
  ) {}

  async registrar(data: {
    usuarioId?: number;
    username: string;
    ip: string;
    evento: string;
    browser: string;
  }) {
    const log = this.logRepo.create(data);
    return await this.logRepo.save(log);
  }

  async findAll() {
    return await this.logRepo.find({
      order: { fecha_hora: 'DESC' },
      relations: ['usuario'],
    });
  }
}
