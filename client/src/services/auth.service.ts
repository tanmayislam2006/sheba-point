"use server";

import { env } from "@/env";
import { setToken } from "@/lib/tokenUtils";
import { cookies } from "next/headers";

export async function getNewTokensWithRefreshToken(
  refreshToken: string,
): Promise<boolean> {
  if (!refreshToken) {
    return false;
  }

  try {
    const res = await fetch(`${env.NEXT_PUBLIC_URL}/auth/refresh-token`, {
      method: "POST",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });
    if (!res.ok) {
      return false;
    }
    const { data } = await res.json();

    const {
      accessToken,
      refreshToken: newRefreshToken,
      token,
    }: {
      accessToken?: string;
      refreshToken?: string;
      token?: string;
    } = data ?? {};

    if (!accessToken && !newRefreshToken && !token) {
      return false;
    }

    const tasks: Promise<void>[] = [];

    if (accessToken) {
      tasks.push(setToken("accessToken", accessToken));
    }

    if (newRefreshToken) {
      tasks.push(setToken("refreshToken", newRefreshToken));
    }

    if (token) {
      tasks.push(setToken("better-auth.session_token", token, 24 * 60 * 60)); // 1 day in seconds
    }

    await Promise.all(tasks);

    return true;
  } catch (error) {
    console.error(
      "Error to generate refreshToken token in auth service ",
      error,
    );
    return false;
  }
}


export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${env.NEXT_PUBLIC_URL}/auth/me`, {
            method: "GET",
            cache: "no-store",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            }
        });

        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const { data } = await res.json();
        return data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}
