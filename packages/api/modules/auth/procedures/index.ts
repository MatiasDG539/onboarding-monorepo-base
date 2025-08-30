import { authRouter as registerRouter } from './register';
import { verifyCodeRouter } from './verify-code';

import { router } from '../../../trpc/base';

export const authRouter = router({
	...registerRouter._def.record,
	verifyCode: verifyCodeRouter._def.record.verify,
});
