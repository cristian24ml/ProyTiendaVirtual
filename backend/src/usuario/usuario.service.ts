import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { pbkdf2Sync, randomBytes } from 'crypto';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
  ) {}

  // Auxiliar para evaluar la fortaleza de contraseña
  private evaluatePasswordStrength(
    password: string,
  ): 'débil' | 'intermedia' | 'fuerte' {
    if (password.length < 8) {
      return 'débil';
    }
    const hasLower = /[a-z]/.test(password);
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^a-zA-Z0-9]/.test(password);

    if (hasLower && hasUpper && hasNumber && hasSpecial) {
      return 'fuerte';
    }
    if ((hasLower || hasUpper) && hasNumber) {
      return 'intermedia';
    }
    return 'débil';
  }

  // Auxiliar para encriptar contraseña
  private hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    const usuario = this.usuarioRepo.create(createUsuarioDto);
    return await this.usuarioRepo.save(usuario);
  }

  async findAll() {
    return await this.usuarioRepo.find({ relations: ['rol'] });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { id },
      relations: ['rol'],
    });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }

  async findOneByUsername(username: string) {
    return await this.usuarioRepo.findOne({
      where: { username },
      relations: ['rol'],
    });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');

    const dataToUpdate: UpdateUsuarioDto = { ...updateUsuarioDto };

    // Si se pasa una contraseña no vacía, se calcula fortaleza y se encripta
    if (dataToUpdate.password && dataToUpdate.password.trim() !== '') {
      dataToUpdate.nivelPassword = this.evaluatePasswordStrength(
        dataToUpdate.password,
      );
      dataToUpdate.password = this.hashPassword(dataToUpdate.password);
    } else {
      // De lo contrario se remueve la contraseña para no sobreescribir con vacío
      delete dataToUpdate.password;
    }

    await this.usuarioRepo.update(id, dataToUpdate);
    return this.findOne(id);
  }

  async remove(id: number) {
    const usuario = await this.usuarioRepo.findOneBy({ id });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return await this.usuarioRepo.delete(id);
  }
}
