import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  getClient() {
    return this.supabase;
  }

  async verifyToken(token: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error) {
        throw new Error(`Invalid token: ${error.message}`);
      }

      return user;
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  async getUserById(userId: string) {
    try {
      const { data: { user }, error } = await this.supabase.auth.admin.getUserById(userId);
      
      if (error) {
        throw new Error(`User not found: ${error.message}`);
      }

      return user;
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }
}
