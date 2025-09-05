import { z } from 'zod';
import { publicProcedure } from '../../../trpc/base';

export const getFeed = publicProcedure
    .input(z.object({
      limit: z.number().optional().default(10),
      cursor: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const posts = await ctx.prisma.post.findMany({
          take: input.limit + 1,
          cursor: input.cursor ? { id: input.cursor } : undefined,
          orderBy: { createdAt: 'desc' },
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                username: true,
                avatar: true,
              }
            },
            comments: {
              include: {
                author: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    username: true,
                    avatar: true,
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 3,
            },
            likes: true,
            _count: {
              select: {
                comments: true,
                likes: true,
              }
            }
          }
        });

        let nextCursor: typeof input.cursor | undefined = undefined;
        if (posts.length > input.limit) {
          const nextItem = posts.pop();
          nextCursor = nextItem!.id;
        }

        return {
          posts,
          nextCursor,
        };
      } catch (error) {
        console.error('Get feed error:', error);
        return { posts: [], nextCursor: undefined };
      }
    });
