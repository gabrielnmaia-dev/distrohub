import { randomBytes } from "node:crypto";

/**
 * IDs curtos para presets (`/api/script/abc1234`).
 *
 * Alfabeto sem caracteres ambíguos (0/o, 1/l/i) para facilitar digitar.
 */
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

export function generateShortId(length = 7): string {
  if (length < 6 || length > 8) {
    throw new Error("shortId deve ter entre 6 e 8 caracteres");
  }

  const bytes = randomBytes(length);
  let id = "";

  for (let index = 0; index < length; index += 1) {
    id += ALPHABET[bytes[index] % ALPHABET.length];
  }

  return id;
}

export const SHORT_ID_PATTERN = /^[a-z0-9]{6,8}$/;
