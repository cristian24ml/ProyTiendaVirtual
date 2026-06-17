import { Module } from '@nestjs/common';
import { LogAccesoService } from './log-acceso.service';
import { LogAccesoController } from './log-acceso.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogAcceso } from './entities/log-acceso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogAcceso])],
  controllers: [LogAccesoController],
  providers: [LogAccesoService],
  exports: [LogAccesoService],
})
export class LogAccesoModule {}
