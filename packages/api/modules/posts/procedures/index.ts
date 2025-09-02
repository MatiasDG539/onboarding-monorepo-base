import { z } from 'zod';
import { router, publicProcedure } from '../../../trpc/base';

export const postsRouter = router({
  create: publicProcedure
    .input(z.object({
      content: z.string().min(1),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const post = await ctx.prisma.post.create({
          data: {
            content: input.content,
            authorId: input.authorId,
          },
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
              }
            },
            likes: true,
          }
        });
        
        return { success: true, post };
      } catch (error) {
        console.error('Create post error:', error);
        return { success: false, error: 'Failed to create post' };
      }
    }),

  getFeed: publicProcedure
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
    }),

  toggleLike: publicProcedure
    .input(z.object({
      postId: z.string(),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const existingLike = await ctx.prisma.like.findFirst({
          where: {
            postId: input.postId,
            authorId: input.authorId,
          }
        });

        if (existingLike) {
          await ctx.prisma.like.delete({
            where: { id: existingLike.id }
          });
          return { success: true, liked: false };
        } else {
          await ctx.prisma.like.create({
            data: {
              postId: input.postId,
              authorId: input.authorId,
            }
          });
          return { success: true, liked: true };
        }
      } catch (error) {
        console.error('Toggle like error:', error);
        return { success: false, error: 'Failed to toggle like' };
      }
    }),

  addComment: publicProcedure
    .input(z.object({
      postId: z.string(),
      content: z.string().min(1),
      authorId: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const comment = await ctx.prisma.comment.create({
          data: {
            content: input.content,
            postId: input.postId,
            authorId: input.authorId,
          },
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
          }
        });
        
        return { success: true, comment };
      } catch (error) {
        console.error('Add comment error:', error);
        return { success: false, error: 'Failed to add comment' };
      }
    }),
});
