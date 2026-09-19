import { UserButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Flame, Heart, Trophy } from "lucide-react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { getUserProgress } from "@/db/queries";

const ProfilePage = async () => {
  await auth.protect();
  const [user, progress] = await Promise.all([
    currentUser(),
    getUserProgress(),
  ]);

  if (!user || !progress?.activeCourse) redirect("/courses");

  return (
    <div className="px-6 pb-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-3xl border-2 bg-gradient-to-b from-sky-50 to-white p-8 text-center">
          <Image
            src={user.imageUrl || "/tlicho-mark.svg"}
            alt="Profile"
            width={96}
            height={96}
            className="mx-auto rounded-full border-4 border-white shadow"
          />
          <h1 className="mt-4 text-3xl font-extrabold text-neutral-800">
            {user.firstName || progress.userName}
          </h1>
          <p className="mt-1 text-neutral-500">
            Learning {progress.activeCourse.title}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl border-2 p-4">
            <Trophy className="mx-auto h-6 w-6 text-amber-500" />
            <p className="mt-2 font-extrabold">{progress.points} XP</p>
          </div>
          <div className="rounded-2xl border-2 p-4">
            <Flame className="mx-auto h-6 w-6 text-orange-500" />
            <p className="mt-2 font-extrabold">{progress.currentStreak} days</p>
          </div>
          <div className="rounded-2xl border-2 p-4">
            <Heart className="mx-auto h-6 w-6 fill-rose-500 text-rose-500" />
            <p className="mt-2 font-extrabold">{progress.hearts} hearts</p>
          </div>
        </div>

        <p className="mt-6 rounded-2xl bg-neutral-50 p-5 text-sm leading-6 text-neutral-600">
          Your account details and sign-out controls are available here and from
          the desktop sidebar.
        </p>
        <div className="mt-4 flex items-center justify-between rounded-2xl border-2 p-5">
          <span className="font-bold text-neutral-700">Account menu</span>
          <UserButton />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
