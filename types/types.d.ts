type UserSocketToUserId = {
  id: string;
  socketId: string;
  name: string;
};

type Invitation = {
  id: string;
  name: string;
};

type WaitingUser = {
  socketId: string;
  userId: string;
};
