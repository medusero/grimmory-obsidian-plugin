import { ApiResponseError } from "./apiResponseError.ts";
import { isRecord } from "./recordGuard.ts";
import type { AuthResponse } from "./types.ts";

export function validateAuthResponse(value: unknown): AuthResponse {
    if (!isRecord(value)) {
        throw new ApiResponseError("The API response is not a valid object.");
    }
    if (
        typeof value.accessToken !== "string" ||
        value.accessToken.trim() === ""
    ) {
        throw new ApiResponseError(
            "The 'accessToken' field must be a non-empty string.",
        );
    }
    if (
        typeof value.refreshToken !== "string" ||
        value.refreshToken.trim() === ""
    ) {
        throw new ApiResponseError(
            "The 'refreshToken' field must be a non-empty string.",
        );
    }
    if (typeof value.expires !== "number" || value.expires <= 0) {
        throw new ApiResponseError(
            "The 'expires' field must be a positive number.",
        );
    }
    return {
        accessToken: value.accessToken,
        refreshToken: value.refreshToken,
        expires: value.expires,
    };
}
