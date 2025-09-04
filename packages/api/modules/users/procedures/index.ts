import { getProfileRouter } from './get-profile';
import { updateProfileRouter } from './update-profile';
import { searchUsersRouter } from './search-users';

import { router } from '../../../trpc/base';

export const usersRouter = router({
  ...getProfileRouter._def.record,
  ...updateProfileRouter._def.record,
  ...searchUsersRouter._def.record,
});
