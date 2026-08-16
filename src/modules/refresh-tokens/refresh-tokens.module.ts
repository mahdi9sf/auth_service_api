import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { DatabaseModule } from 'src/database/database.module';
import { PasswordModule } from 'src/common/password/password.module';

@Module({
  imports: [DatabaseModule],
  providers: [RefreshTokensService],
  exports: [RefreshTokensService],
})
export class RefreshTokensModule {}
