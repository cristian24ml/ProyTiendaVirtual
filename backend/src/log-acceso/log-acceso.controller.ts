import { Controller, Get } from '@nestjs/common';
import { LogAccesoService } from './log-acceso.service';

@Controller('log-acceso')
export class LogAccesoController {
  constructor(private readonly logService: LogAccesoService) {}

  @Get()
  findAll() {
    return this.logService.findAll();
  }
}
