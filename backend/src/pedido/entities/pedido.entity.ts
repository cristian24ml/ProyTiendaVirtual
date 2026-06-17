import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { DetallePedido } from 'src/detalle-pedido/entities/detalle-pedido.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity()
export class Pedido {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn() //la fecha se genera automaticamente
  fecha: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  total: number;

  @Column({ nullable: true })
  nombreCompleto: string;

  @Column({ nullable: true })
  telefono: string;

  @Column({ nullable: true })
  correo: string;

  @Column({ nullable: true })
  usuarioId: number;

  @Column({ nullable: true, default: 'Efectivo' })
  metodoPago: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @OneToMany(() => DetallePedido, (detalle) => detalle.pedido, {
    cascade: true,
  })
  detalles: DetallePedido[];
}
