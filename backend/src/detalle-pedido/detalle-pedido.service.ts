import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDetallePedidoDto } from './dto/create-detalle-pedido.dto';
import { UpdateDetallePedidoDto } from './dto/update-detalle-pedido.dto';
import { DetallePedido } from './entities/detalle-pedido.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class DetallePedidoService {
  //usamos un repositorio
  constructor(
    @InjectRepository(DetallePedido)
    private readonly detallePedRepo: Repository<DetallePedido>,
  ) {}

  //Registrar un DetallePedido
  async create(createDetallePedidoDto: CreateDetallePedidoDto) {
    const detallepedido = this.detallePedRepo.create(createDetallePedidoDto);
    return await this.detallePedRepo.save(detallepedido);
  }

  // Mostra los datos de la Tabla DetallePedido
  async findAll() {
    return await this.detallePedRepo.find();
    // select * from DetallePedido
  }

  //Buscar Producto por ID
  async findOne(id: number) {
    const detallepedido = await this.detallePedRepo.findOneBy({ id: id });
    //select * from DetallePedido where id = id

    //validamos en caso de que el producto con ID no exista, devuelva un mensaje
    if (!detallepedido)
      throw new NotFoundException('Detalle Pedido no encontrado');
    return detallepedido;
  }

  // Actualizar DetallePedido
  async update(id: number, updateDetallePedidoDto: UpdateDetallePedidoDto) {
    const detallepedido = await this.detallePedRepo.findOneBy({ id: id });
    if (!detallepedido)
      throw new NotFoundException('Detalle Pedido no encontrado');
    return await this.detallePedRepo.update(id, updateDetallePedidoDto);
  }

  // Eliminar DetallePedido
  async remove(id: number) {
    const detallepedido = await this.detallePedRepo.findOneBy({ id: id });
    if (!detallepedido)
      throw new NotFoundException('Detalle Pedido no encontrado');
    return await this.detallePedRepo.delete(id);
  }
}
