"use server";

import { revalidatePath } from "next/cache";
import { DnsProvider } from "@/components/domains/components/constants";

interface CreateDomainData {
  domain: string;
  provider: DnsProvider;
}

export async function createDomain(data: CreateDomainData) {
  try {
    const response = await fetch(`${process.env.APP_URL}/api/domains`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      let errorMessage = "Failed to create domain";
      try {
        const error = (await response.json()) as { message?: string };
        if (error.message && typeof error.message === "string") {
          errorMessage = error.message;
        }
      } catch {
        // Ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    const domain = await response.json();
    revalidatePath("/dashboard/domains");
    return domain;
  } catch (error) {
    console.error("Error creating domain:", error);
    throw error;
  }
}

export async function getDomains() {
  try {
    const response = await fetch(`${process.env.APP_URL}/api/domains`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch domains";
      try {
        const error = (await response.json()) as { message?: string };
        if (error.message && typeof error.message === "string") {
          errorMessage = error.message;
        }
      } catch {
        // Ignore JSON parsing errors
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching domains:", error);
    throw error;
  }
}
