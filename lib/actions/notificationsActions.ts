"use server";

import { mockNotifications as notifications } from "../data/notifications.mock";

export async function getNotifications() {
  return { notifications: notifications };
}
