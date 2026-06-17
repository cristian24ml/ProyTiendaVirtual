import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  async create(createRolDto: CreateRolDto) {
    const rol = this.rolRepo.create(createRolDto);
    return await this.rolRepo.save(rol);
  }

  async findAll() {
    return await this.rolRepo.find();
  }

  async findOne(id: number) {
    const rol = await this.rolRepo.findOneBy({ id: id });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return rol;
  }

  async update(id: number, updateRolDto: UpdateRolDto) {
    const rol = await this.rolRepo.findOneBy({ id: id });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return await this.rolRepo.update(id, updateRolDto);
  }

  async remove(id: number) {
    const rol = await this.rolRepo.findOneBy({ id: id });
    if (!rol) throw new NotFoundException('Rol no encontrado');
    return await this.rolRepo.delete(id);
  }
}
