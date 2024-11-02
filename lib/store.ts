export const activeUsers: Record<string, UserSocketToUserId> = {};
export const activeUsersSocketToUser: { [socketId: string]: string } = {};
export const usersWaiting: WaitingUser[] = [];
export const playRoom: PlayRoom = {};

