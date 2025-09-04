import { createPostRouter } from './create';
import { getFeedRouter } from './get-feed';
import { toggleLikeRouter } from './toggle-like';
import { addCommentRouter } from './add-comment';

import { router } from '../../../trpc/base';

export const postsRouter = router({
  ...createPostRouter._def.record,
  ...getFeedRouter._def.record,
  ...toggleLikeRouter._def.record,
  ...addCommentRouter._def.record,
});
