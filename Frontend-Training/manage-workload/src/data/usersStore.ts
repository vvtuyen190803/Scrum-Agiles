import type { User } from "../types/auth.type";
import { dummyUsers } from "./users";

const USERS_STORAGE_KEY = "users_store";

const loadUsersFromStorage = () => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as User[];
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
};

const persistUsers = (users: User[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

let userStore: User[] = loadUsersFromStorage() ?? [...dummyUsers];
persistUsers(userStore);

export const getUsersStore = () => userStore;

export const setUsersStore = (nextUsers: User[]) => {
  userStore = nextUsers;
  persistUsers(userStore);
};

export const addUserToStore = (user: User) => {
  userStore = [user, ...userStore];
  persistUsers(userStore);
};

export const updateUserInStore = (updatedUser: Partial<User> & { id: number }) => {
  userStore = userStore.map((user) =>
    user.id === updatedUser.id ? { ...user, ...updatedUser } : user
  );
  persistUsers(userStore);
};
