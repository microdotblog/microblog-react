import * as Crypto from 'expo-crypto'
import { createAuthorization } from '../../src/utils/indieauth'

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  CryptoEncoding: { BASE64: 'base64' },
  getRandomBytesAsync: jest.fn(async size => new Uint8Array(require('crypto').randomBytes(size))),
  digestStringAsync: jest.fn(async (algorithm, value) => require('crypto').createHash('sha256').update(value).digest('base64'))
}))

beforeEach(() => jest.clearAllMocks())

test('generates compact URL-safe state and a fresh verifier for each attempt', async () => {
  const first = await createAuthorization(true)
  const second = await createAuthorization(true)
  expect(first.state).toMatch(/^[A-Za-z0-9_-]{22}$/)
  expect(first.code_verifier).toMatch(/^[A-Za-z0-9_-]{43}$/)
  expect(first.code_challenge).toMatch(/^[A-Za-z0-9_-]{43}$/)
  expect(first.state).not.toBe(second.state)
  expect(first.code_verifier).not.toBe(second.code_verifier)
  expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(16)
  expect(Crypto.getRandomBytesAsync).toHaveBeenCalledWith(32)
})

test('matches the RFC 7636 S256 test vector', async () => {
  Crypto.getRandomBytesAsync.mockResolvedValueOnce(new Uint8Array(16)).mockResolvedValueOnce(new Uint8Array([
    116, 24, 223, 180, 151, 153, 224, 37, 79, 250, 96, 125, 216, 173, 187, 186,
    22, 212, 37, 77, 105, 214, 191, 240, 91, 88, 5, 88, 83, 132, 141, 121
  ]))
  const authorization = await createAuthorization(true)
  expect(authorization.code_verifier).toBe('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')
  expect(authorization.code_challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM')
})

test('legacy authorization generates state without generating a PKCE verifier', async () => {
  const authorization = await createAuthorization(false)
  expect(authorization).toEqual({ state: expect.stringMatching(/^[A-Za-z0-9_-]{22}$/) })
  expect(Crypto.getRandomBytesAsync).toHaveBeenCalledTimes(1)
  expect(Crypto.digestStringAsync).not.toHaveBeenCalled()
})
