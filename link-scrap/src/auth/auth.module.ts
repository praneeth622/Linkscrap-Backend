import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseService } from './supabase.config';
import { AuthGuard } from './auth.guard';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SupabaseService, AuthGuard],
  exports: [SupabaseService, AuthGuard],
})
export class AuthModule {}
