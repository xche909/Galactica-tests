import { AuthSteps } from '../steps/auth.steps';

export default async function globalTeardown() {
  await AuthSteps.cleanupTestUsers();
}
