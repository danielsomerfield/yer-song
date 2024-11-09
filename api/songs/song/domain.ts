import { User } from "../domain/user";

export interface SongRequestInput {
  voter: User;
  songId: string;
  value: number;
  voucher?: string;
}

export interface Vote {
  voter: User;
  songId: string;
}
