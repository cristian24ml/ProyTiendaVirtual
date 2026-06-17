import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';
import { CategoriaController } from './categoria.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Categoria } from './entities/categoria.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  // mandamos nuesta tabla Producto
  imports: [TypeOrmModule.forFeature([Categoria]), AuthModule],
  controllers: [CategoriaController],
  providers: [CategoriaService],
})
export class CategoriaModule {}
