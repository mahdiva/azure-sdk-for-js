// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

export function isUint8Array(value: any): boolean {
  return value instanceof Uint8Array;
}

/**
 * Encodes a byte array in base64 format.
 * @param value the Uint8Aray to encode
 */
export function encodeByteArray(value: Uint8Array): string {
  let str = "";
  for (let i = 0; i < value.length; i++) {
    str += String.fromCharCode(value[i]);
  }
  return btoa(str);
}

/**
 * Decodes a base64 string into a byte array.
 * @param value the base64 string to decode
 */
export function decodeString(value: string): Uint8Array {
  const byteString = atob(value);
  const byteArray = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    byteArray[i] = byteString.charCodeAt(i);
  }
  return byteArray;
}
