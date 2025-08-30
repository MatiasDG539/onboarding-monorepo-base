import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';


type UserData = z.infer<typeof userDataSchema>;

const users = new Map<string, UserData>();

const userDataSchema = z.object({
  emailOrPhone: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  phoneNumber: z.string(),
  birthdate: z.string(),
  // profilePicture omitted for simplicity (File type not serializable)
});

export const authRouter = router({
  register: publicProcedure
    .input(userDataSchema)
    .mutation(({ input }) => {
      if (users.has(input.emailOrPhone) || users.has(input.username)) {
        return { success: false, error: 'User already exists' };
      }
      users.set(input.emailOrPhone, input);
      users.set(input.username, input);
      return { success: true, user: input };
    }),

  getUser: publicProcedure
    .input(z.string())
    .query(({ input }) => {
      const user = users.get(input);
      return user || null;
    }),
});
