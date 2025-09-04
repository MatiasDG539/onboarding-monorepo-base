import { checkEmailExistsRouter } from './check-email-exists';
import { registerRouter } from './register';
import { getUserRouter } from './get-user';
import { loginRouter } from './login';
import { verifyCodeRouter } from './verify-code';

import { router } from '../../../trpc/base';

export const authRouter = router({
	...checkEmailExistsRouter._def.record,
	...registerRouter._def.record,
	...getUserRouter._def.record,
	...loginRouter._def.record,
	verifyCode: verifyCodeRouter._def.record.verify,
});
