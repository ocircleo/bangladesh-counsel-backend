const { RefreshToken } = require("../../Models/Token");

const SaveRefreshToken = async (userId, deviceId, refreshToken) => {
  try {
    const refreshTokenData = new RefreshToken({
      user: userId,
      deviceId: deviceId,
      token: refreshToken,
    });
    await refreshTokenData.save();
  } catch (error) {
    console.error("Error saving refresh token:", error.message);
  }
};
const removeOlderRefreshToken = async (userId) => {
  try {
    const allRefreshTokens = await RefreshToken.find({ user: userId }).sort({
      createdAt: 1,
    });
    if (allRefreshTokens.length <= 2) return; //keep maximum 2 tokens
    const tokensToRemove = []; //tokens that will be removed
    const lastToken = allRefreshTokens[allRefreshTokens.length - 1];

    const filteredTokens = []; //temporary store for filtered tokens

    //1.Filter out duplicate device tokens of -> last logged in device
    for (let i = 0; i < allRefreshTokens.length - 1; i++) {
      const token = allRefreshTokens[i];
      if (token.deviceId == lastToken.deviceId) tokensToRemove.push(token);
      else filteredTokens.push(token);
    }
    //2.Again keep only the last token among non duplicate tokens
    for (let i = 0; i < filteredTokens.length - 1; i++)
      tokensToRemove.push(filteredTokens[i]);
    const removePromises = tokensToRemove.map((token) =>
      RefreshToken.deleteOne({ _id: token._id })
    );
     await Promise.all(removePromises);
  } catch (error) {
    console.error("Error saving refresh token:", error.message);
  }
};

module.exports = { SaveRefreshToken, removeOlderRefreshToken };
