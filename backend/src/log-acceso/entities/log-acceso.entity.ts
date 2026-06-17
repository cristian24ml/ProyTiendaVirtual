import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Entity()
export class LogAcceso {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  usuarioId: number;

  @ManyToOne(() => Usuario, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuarioId' })
  usuario: Usuario;

  @Column()
  username: string;

  @Column()
  ip: string;

  @Column()
  evento: string; // 'ingreso' o 'salida'

  @Column()
  browser: string;

  @CreateDateColumn()
  fecha_hora: Date;
}
