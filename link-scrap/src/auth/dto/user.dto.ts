import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Zod schema for user creation
export const CreateUserSchema = z.object({
  email: z.string().email('Must be a valid email address').describe('User email address'),
  name: z.string().min(1, 'Name is required').describe('User full name'),
  avatar: z.string().url().optional().describe('User avatar URL')
});

// Zod schema for user update
export const UpdateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').optional().describe('User full name'),
  avatar: z.string().url().optional().describe('User avatar URL'),
  is_active: z.boolean().optional().describe('User active status'),
  preferences: z.any().optional().describe('User preferences')
});

// Zod schema for user response
export const UserSchema = z.object({
  id: z.string().uuid().describe('User unique identifier'),
  email: z.string().email().describe('User email address'),
  name: z.string().describe('User full name'),
  avatar: z.string().url().optional().describe('User avatar URL'),
  is_active: z.boolean().describe('User active status'),
  preferences: z.any().optional().describe('User preferences'),
  created_at: z.string().datetime().describe('User creation timestamp'),
  updated_at: z.string().datetime().describe('User last update timestamp')
});

// Create DTOs using nestjs-zod
export class CreateUserDto extends createZodDto(CreateUserSchema) {}
export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}
export class UserDto extends createZodDto(UserSchema) {}

// Export schemas for validation
// export { CreateUserSchema, UpdateUserSchema, UserSchema };
