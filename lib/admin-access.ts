export const isAdminUser = (
  userId: string | null | undefined,
  adminIds: string[]
) => !!userId && adminIds.includes(userId);
