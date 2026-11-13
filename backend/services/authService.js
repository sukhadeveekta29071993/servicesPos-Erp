const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");

const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} = require("../utils/generateTokens");

const createSession = async (user, req) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  const decoded = verifyRefreshToken(refreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
    userAgent: req.get("user-agent") || null,
    ipAddress: req.ip || null,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const rotateSession = async (refreshToken, req) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded.sub || !decoded.jti || decoded.type !== "refresh") {
    throw new Error("Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({
    tokenHash,
  });

  if (!storedToken) {
    throw new Error("Refresh session not found");
  }

  if (storedToken.revokedAt) {
    // Refresh-token reuse detected: revoke all user sessions.
    await RefreshToken.updateMany(
      { user: storedToken.user, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );

    throw new Error("Refresh token reuse detected. Please login again.");
  }

  if (
    storedToken.user.toString() !== decoded.sub ||
    storedToken.expiresAt <= new Date()
  ) {
    throw new Error("Refresh session expired");
  }

  const user = await User.findById(decoded.sub);

  if (!user || user.status !== "active") {
    storedToken.revokedAt = new Date();
    await storedToken.save();

    throw new Error("User account is unavailable");
  }

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);

  const newDecoded = verifyRefreshToken(newRefreshToken);
  const newHash = hashToken(newRefreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash: newHash,
    expiresAt: new Date(newDecoded.exp * 1000),
    userAgent: req.get("user-agent") || null,
    ipAddress: req.ip || null,
  });

  storedToken.revokedAt = new Date();
  storedToken.replacedByTokenHash = newHash;

  await storedToken.save();

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
  };
};

const revokeSession = async (refreshToken) => {
  if (!refreshToken) return;

  await RefreshToken.updateOne(
    {
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    },
    {
      $set: {
        revokedAt: new Date(),
      },
    },
  );
};

module.exports = {
  createSession,
  rotateSession,
  revokeSession,
};
