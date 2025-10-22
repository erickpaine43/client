"use server";
import { nile } from '../../app/api/[...nile]/nile';

/**
 * NileDB Auth integration using official NileDB packages
 */

// Server-side auth functions
export async function getServerUser() {
  const me = await nile.users.getSelf();
  if (me instanceof Response) {
    return null; // User not authenticated
  }
  return me;
}

export async function getServerSession() {
  return await nile.auth.getSession();
}

export async function getUserTenants() {
  const tenants = await nile.tenants.list();
  if (tenants instanceof Response) {
    return [];
  }
  return tenants;
}

export async function verifyUserEmail(callbackUrl?: string) {
  "use server";
  const res = await nile.users.verifySelf({
    callbackUrl: callbackUrl || "/dashboard",
  }, true);

  if (res instanceof Response && !res.ok) {
    return { ok: false, message: await res.text() };
  }
  return { ok: true, message: "Check your email for verification" };
}

// Export the nile instance for use in other parts of the app
export { nile };