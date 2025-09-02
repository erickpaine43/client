"use server";

import { nile } from "@/app/api/[...nile]/nile";

import {
  NileUser,
  ProfileFormData,
  mapFormDataToNileUpdate,
  validateProfileUpdateData
} from "@/lib/utils";

// Profile update payload for NileDB
export interface ProfileUpdatePayload {
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
}

// Server action response types
export interface ProfileActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ProfileError;
}

export interface ProfileError {
  type: "auth" | "validation" | "network" | "server";
  message: string;
  field?: string; // For field-specific validation errors
}

// Validation function for profile update data
function validateProfileData(data: Partial<ProfileFormData>): ProfileError | null {
  // Check required fields
  if (!data.name || data.name.trim().length === 0) {
    return {
      type: "validation",
      message: "Display name is required",
      field: "name"
    };
  }

  if (!data.firstName || data.firstName.trim().length === 0) {
    return {
      type: "validation",
      message: "First name is required",
      field: "firstName"
    };
  }

  if (!data.lastName || data.lastName.trim().length === 0) {
    return {
      type: "validation",
      message: "Last name is required",
      field: "lastName"
    };
  }

  // Check length constraints
  if (data.firstName && data.firstName.length > 50) {
    return {
      type: "validation",
      message: "First name must be 50 characters or less",
      field: "firstName"
    };
  }

  if (data.lastName && data.lastName.length > 50) {
    return {
      type: "validation",
      message: "Last name must be 50 characters or less",
      field: "lastName"
    };
  }

  if (data.name && data.name.length > 100) {
    return {
      type: "validation",
      message: "Display name must be 100 characters or less",
      field: "name"
    };
  }

  // Check avatar URL format if provided
  if (data.avatarUrl && data.avatarUrl.trim().length > 0 && !data.avatarUrl.match(/^https?:\/\/.+/)) {
    return {
      type: "validation",
      message: "Avatar URL must be a valid HTTP/HTTPS URL",
      field: "avatarUrl"
    };
  }

  return null;
}

// Server actions
export async function getUserProfile(): Promise<ProfileActionResponse<NileUser>> {
  try {
    // Call NileDB to get the current user profile
    const user = await nile.users.getSelf();

    // Check if we got a Response object (error case)
    if (user instanceof Response) {
      if (user.status === 401) {
        return {
          success: false,
          error: {
            type: "auth",
            message: "You must be logged in to view your profile"
          }
        };
      }

      return {
        success: false,
        error: {
          type: "server",
          message: "Failed to retrieve user profile from server"
        }
      };
    }

    if (!user || typeof user !== "object") {
      return {
        success: false,
        error: {
          type: "network",
          message: "Failed to retrieve user data from NileDB"
        }
      };
    }

    // Validate that the user has the expected structure
    if (!user.id || !user.email) {
      return {
        success: false,
        error: {
          type: "server",
          message: "Invalid user data received from NileDB"
        }
      };
    }

    return {
      success: true,
      data: user as NileUser
    };

  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
      return {
        success: false,
        error: {
          type: "auth",
          message: "You must be logged in to view your profile"
        }
      };
    }

    // Handle network errors
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
      return {
        success: false,
        error: {
          type: "network",
          message: "Network error. Please check your connection and try again"
        }
      };
    }

    // Handle server errors
    console.error("getUserProfile error:", error);
    return {
      success: false,
      error: {
        type: "server",
        message: "An error occurred while retrieving your profile"
      }
    };
  }
}

export async function updateUserProfile(
  profileData: Partial<ProfileFormData>
): Promise<ProfileActionResponse<NileUser>> {
  try {
    // Validate input data
    const validationError = validateProfileData(profileData);
    if (validationError) {
      return {
        success: false,
        error: validationError
      };
    }

    // Convert form data to NileDB update payload
    const updatePayload = mapFormDataToNileUpdate(profileData);

    // Check if there's anything to update
    if (Object.keys(updatePayload).length === 0) {
      return {
        success: false,
        error: {
          type: "validation",
          message: "No valid changes to update"
        }
      };
    }

    // Call NileDB to update the user profile
    const updatedUser = await nile.users.updateSelf(updatePayload);

    // Check if we got a Response object (error case)
    if (updatedUser instanceof Response) {
      if (updatedUser.status === 401) {
        return {
          success: false,
          error: {
            type: "auth",
            message: "Your session has expired. Please log in again"
          }
        };
      }

      return {
        success: false,
        error: {
          type: "server",
          message: "Failed to update profile. Please try again"
        }
      };
    }

    // Handle case where updateSelf returns array (if that's what the API does)
    if (Array.isArray(updatedUser)) {
      if (updatedUser.length === 0) {
        return {
          success: false,
          error: {
            type: "server",
            message: "Failed to update profile. User data not returned"
          }
        };
      }

      return {
        success: true,
        data: updatedUser[0] as NileUser
      };
    }

    if (!updatedUser || typeof updatedUser !== "object") {
      return {
        success: false,
        error: {
          type: "server",
          message: "Failed to update profile. Please try again"
        }
      };
    }

    return {
      success: true,
      data: updatedUser as NileUser
    };

  } catch (error: any) {
    // Handle authentication errors
    if (error.message?.includes("401") || error.message?.includes("unauthorized")) {
      return {
        success: false,
        error: {
          type: "auth",
          message: "Your session has expired. Please log in again"
        }
      };
    }

    // Handle network errors
    if (error.message?.includes("fetch") || error.message?.includes("network")) {
      return {
        success: false,
        error: {
          type: "network",
          message: "Network error. Please check your connection and try again"
        }
      };
    }

    // Handle field-specific errors if available
    if (error.message?.includes("givenName") || error.message?.includes("familyName")) {
      return {
        success: false,
        error: {
          type: "validation",
          message: "Invalid name format detected",
          field: error.message?.includes("givenName") ? "firstName" : "lastName"
        }
      };
    }

    // Handle server errors
    console.error("updateUserProfile error:", error);
    return {
      success: false,
      error: {
        type: "server",
        message: error.message || "An error occurred while updating your profile"
      }
    };
  }
}
