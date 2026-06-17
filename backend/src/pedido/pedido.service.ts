import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePedidoDto } from './dto/create-pedido.dto';
import { UpdatePedidoDto } from './dto/update-pedido.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pedido } from './entities/pedido.entity';
import { Producto } from 'src/productos/entities/producto.entity';
import { DetallePedido } from 'src/detalle-pedido/entities/detalle-pedido.entity';

@Injectable()
export class PedidoService {
  constructor(
    @InjectRepository(Pedido)
    private readonly pedidoRepo: Repository<Pedido>,
    @InjectRepository(Producto)
    private readonly productoRepo: Repository<Producto>,
  ) {}

  //Registrar un Pedido y descontar stock
  async create(createPedidoDto: CreatePedidoDto) {
    // Si vienen detalles, descontamos el stock de los productos correspondientes
    if (createPedidoDto.detalles && createPedidoDto.detalles.length > 0) {
      for (const detail of createPedidoDto.detalles) {
        const prod = await this.productoRepo.findOneBy({
          id: detail.productoId,
        });
        if (prod) {
          // Descontar del stock y evitar que sea menor que 0
          prod.stock = Math.max(0, prod.stock - detail.cantidad);
          await this.productoRepo.save(prod);
        }
      }
    }

    const pedido = this.pedidoRepo.create(createPedidoDto);
    const savedPedido = await this.pedidoRepo.save(pedido);
    return await this.findOne(savedPedido.id);
  }

  // Mostrar los datos de la Tabla Pedido
  async findAll() {
    return await this.pedidoRepo.find({
      relations: ['detalles', 'usuario', 'detalles.producto'],
    });
  }

  //Buscar Pedido por ID
  async findOne(id: number) {
    const pedido = await this.pedidoRepo.findOne({
      where: { id: id },
      relations: ['detalles', 'usuario', 'detalles.producto'],
    });

    //validamos en caso de que el pedido con ID no exista, devuelva un mensaje
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return pedido;
  }

  // Actualizar Pedido
  async update(id: number, updatePedidoDto: UpdatePedidoDto) {
    const pedido = await this.pedidoRepo.findOneBy({ id: id });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return await this.pedidoRepo.update(id, updatePedidoDto);
  }

  // Eliminar Pedido
  async remove(id: number) {
    const pedido = await this.pedidoRepo.findOneBy({ id: id });
    if (!pedido) throw new NotFoundException('Pedido no encontrado');
    return await this.pedidoRepo.delete(id);
  }

  // Obtener los productos más vendidos
  async getMasVendidos() {
    const rawData = await this.pedidoRepo.manager
      .createQueryBuilder(DetallePedido, 'dp')
      .leftJoin('dp.producto', 'p')
      .select(
        "COALESCE(p.nombre, CONCAT('Producto Eliminado ID ', dp.productoId))",
        'nombre',
      )
      .addSelect('SUM(dp.cantidad)', 'totalVendido')
      .groupBy('dp.productoId')
      .addGroupBy('p.nombre')
      .orderBy('totalVendido', 'DESC')
      .limit(10)
      .getRawMany();

    const items = rawData as Array<{
      nombre: string;
      totalVendido: string | number;
    }>;

    return items.map((item) => ({
      nombre: item.nombre,
      totalVendido: Number(item.totalVendido),
    }));
  }
}
