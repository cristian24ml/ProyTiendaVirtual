import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from './entities/categoria.entity';

@Injectable()
export class CategoriaService {
  //usamos un repositorio
  constructor(
    @InjectRepository(Categoria)
    private readonly categoriaRepo: Repository<Categoria>,
  ) {}

  //Registrar un Categoria
  async create(createCategoriaDto: CreateCategoriaDto) {
    const categoria = this.categoriaRepo.create(createCategoriaDto);
    return await this.categoriaRepo.save(categoria);
  }

  // Mostra los datos de la Tabla Categoria
  async findAll() {
    return await this.categoriaRepo.find();
    // select * from categoria
  }

  //Buscar Categoria por ID
  async findOne(id: number) {
    const categoria = await this.categoriaRepo.findOneBy({ id: id });
    //select * from categoria where id = id

    //validamos en caso de que el producto con ID no exista, devuelva un mensaje
    if (!categoria) throw new NotFoundException('Categoria no encontrado');
    return categoria;
  }

  // Actualizar Categoria
  async update(id: number, updateCategoriaDto: UpdateCategoriaDto) {
    const categoria = await this.categoriaRepo.findOneBy({ id: id });
    if (!categoria) throw new NotFoundException('Categoria no encontrado');
    return await this.categoriaRepo.update(id, updateCategoriaDto);
  }

  // Eliminar Categoria
  async remove(id: number) {
    const categoria = await this.categoriaRepo.findOneBy({ id: id });
    if (!categoria) throw new NotFoundException('Categoria no encontrado');
    return await this.categoriaRepo.delete(id);
  }
}
