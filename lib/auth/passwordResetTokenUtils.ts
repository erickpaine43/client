import { ConvexHttpClient } from 'convex/browser';

export interface TokenInfo {
  _id?: string;
  email: string;
  expired: boolean;
  used: boolean;
}

export async function validateToken(convex: ConvexHttpClient, token: string): Promise<TokenInfo> {
  const tokenInfo = await (convex as any).query('passwordResetTokens:validateToken', {
    token,
  });

  if (!tokenInfo) {
    throw new Error('Invalid reset token');
  }

  if (tokenInfo.expired) {
    throw new Error('Reset token has expired');
  }

  if (tokenInfo.used) {
    throw new Error('Reset token has already been used');
  }

  return tokenInfo;
}
