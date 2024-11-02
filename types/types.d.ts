type UserSocketToUserId = {
  id: string;
  socketId: string;
  name: string;
  gameRoomId?: string;
};

type Invitation = {
  id: string;
  name: string;
};

type WaitingUser = {
  socketId: string;
  userId: string;
};

type PlayRoomProps = {
  userId1: string;
  userId2: string;
  turnUserId: string;
  turn: string;
} & (
  | { user1Symbol: "X"; user2Symbol: "O" }
  | { user1Symbol: "O"; user2Symbol: "X" }
);

type PlayRoom = { [playRoomId: string]: PlayRoomProps };
