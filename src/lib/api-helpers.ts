import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User, IUser } from "@/models/User";

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user as { id: string; name: string; email: string; role: string };
}

export async function getUserFromSession(): Promise<IUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  await connectDB();
  return User.findById(session.user.id);
}

export function forbidden() {
  return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Belum login." }, { status: 401 });
}
