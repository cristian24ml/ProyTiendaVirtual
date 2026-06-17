import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Producto } from './entities/producto.entity';

@Injectable()
export class ProductosService {
  //usamos un repositorio
  constructor(
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  //Registrar un Producto
  async create(createProductoDto: CreateProductoDto) {
    const producto = this.productoRepo.create(createProductoDto);
    return await this.productoRepo.save(producto);
  }

  // Mostra los datos de la Tabla Producto
  async findAll() {
    return await this.productoRepo.find();
    // select * from productos
  }

  //Buscar Producto por ID
  async findOne(id: number) {
    const producto = await this.productoRepo.findOneBy({ id: id });
    //select * from productos where id = id

    //validamos en caso de que el producto con ID no exista, devuelva un mensaje
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return producto;
  }

  // Actualizar Producto
  async update(id: number, updateProductoDto: UpdateProductoDto) {
    const producto = await this.productoRepo.findOneBy({ id: id });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return await this.productoRepo.update(id, updateProductoDto);
  }

  // Eliminar Producto
  async remove(id: number) {
    const producto = await this.productoRepo.findOneBy({ id: id });
    if (!producto) throw new NotFoundException('Producto no encontrado');
    return await this.productoRepo.delete(id);
  }
}
