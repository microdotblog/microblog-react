import * as Crypto from 'expo-crypto'
import { fromByteArray } from 'base64-js'

const toBase64Url = value => value.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const randomString = async byte_count => {
  const bytes = await Crypto.getRandomBytesAsync(byte_count)
  return toBase64Url(fromByteArray(bytes))
}

export async function createAuthorization(use_pkce) {
  const state = await randomString(16)
  if (!use_pkce) {
    return { state }
  }

  // 32 random bytes produce the minimum 43-character PKCE verifier.
  const code_verifier = await randomString(32)
  const digest = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, code_verifier, {
    encoding: Crypto.CryptoEncoding.BASE64
  })
  return { state, code_verifier, code_challenge: toBase64Url(digest) }
}
