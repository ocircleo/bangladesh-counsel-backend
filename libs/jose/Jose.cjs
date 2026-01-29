// jose.cjs
let joseCache = null;

async function loadJose() {
  if (!joseCache) {
    joseCache = await import('jose');
  }
  return joseCache;
}

async function getJose() {
  const { SignJWT, jwtVerify, base64url } = await loadJose();
  return { SignJWT, jwtVerify, base64url };
}

module.exports = {
  getJose
};
