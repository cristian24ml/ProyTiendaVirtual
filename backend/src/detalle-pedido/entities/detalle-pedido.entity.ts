import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Pedido } from 'src/pedido/entities/pedido.entity';
import { Producto } from 'src/productos/entities/producto.entity';

@Entity()
export class DetallePedido {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  pedidoId: number;

  @ManyToOne(() => Pedido, (pedido) => pedido.detalles)
  @JoinColumn({ name: 'pedidoId' })
  pedido: Pedido;

  @Column({ nullable: true })
  productoId: number;

  @ManyToOne(() => Producto)
  @JoinColumn({ name: 'productoId' })
  producto: Producto;

  @Column()
  cantidad: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precioUnitario: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  subtotal: number;

  @Column({ type: 'text', nullable: true })
  personalizacion: string;
}
