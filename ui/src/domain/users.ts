export interface UserInput {
  name: string;
}

export interface User extends UserInput {
  id: string;
  roles?: string[];
}
