import { auth } from "@clerk/nextjs/server";

import { isAdminUser } from "./admin-access";
import { getAdminEnvironment } from "./env";

export const getIsAdmin = async () => {
  const { userId } = await auth();
  const { adminIds } = getAdminEnvironment();

  return isAdminUser(userId, adminIds);
};
