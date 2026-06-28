const KEY = "owner_token";

export function getOwnerToken(): string | null {
  return localStorage.getItem(KEY);
}

export function setOwnerToken(token: string) {
  localStorage.setItem(KEY, token);
}

export function clearOwnerToken() {
  localStorage.removeItem(KEY);
}
