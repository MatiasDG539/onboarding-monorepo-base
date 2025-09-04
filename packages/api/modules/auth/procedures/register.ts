import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';
import bcrypt from 'bcryptjs';

const userDataSchema = z.object({
  emailOrPhone: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  username: z.string().min(3),
  phoneNumber: z.string().optional(),
  birthdate: z.string().transform(str => new Date(str)),
});

export const registerRouter = router({
  register: publicProcedure
    .input(userDataSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        
        const existingUser = await ctx.prisma.user.findFirst({
          where: {
            OR: [
              { email: input.emailOrPhone },
              { username: input.username }
            ]
          }
        });

        if (existingUser) {
          return { success: false, error: 'User already exists' };
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const verificationCode = Math.floor(100000 + Math.random() * 900000);

        const user = await ctx.prisma.user.create({
          data: {
            firstName: input.firstName,
            lastName: input.lastName,
            email: input.emailOrPhone,
            password: hashedPassword,
            username: input.username,
            dateOfBirth: input.birthdate,
            avatar: '',
            verificationCode,
            isVerified: false,
          }
        });

        return { 
          success: true, 
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
          },
          verificationCode: user.verificationCode
        };
      } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Failed to create user' };
      }
    }),
});
