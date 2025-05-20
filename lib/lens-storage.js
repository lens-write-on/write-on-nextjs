'use client';
import { getCookie, setCookie, deleteCookie } from "cookies-next";

export const storage = {
  getItem(key) {
    return getCookie(key) ?? null;
  },

  async setItem(key, value) {
    await setCookie(key, value);
  },

  async removeItem(key) {
    await deleteCookie(key);
  },
};

export default storage;