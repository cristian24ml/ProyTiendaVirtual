import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { LogAccesoModule } from 'src/log-acceso/log-acceso.module';
import { AuthGuard } from './auth.guard';
import { AdminGuard } from './admin.guard';
import { PersonalGuard } from './personal.guard';

@Module({
  imports: [forwardRef(() => UsuarioModule), LogAccesoModule],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, AdminGuard, PersonalGuard],
  exports: [AuthService, AuthGuard, AdminGuard, PersonalGuard],
})
export class AuthModule {}
