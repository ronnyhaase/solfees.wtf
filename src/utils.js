const SOL_PER_LAMPORT = 0.000000001

const isSolanaAddress = value => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)

export {
  SOL_PER_LAMPORT,
  isSolanaAddress,
}
