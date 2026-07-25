"use client";

import Image from "next/image";
import { useState } from "react";

type ExperienceHostAvatarProps = {
  initial: string;
  photoUrl: string | null;
};

export function ExperienceHostAvatar({
  initial,
  photoUrl
}: ExperienceHostAvatarProps) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <span className="experience-host-avatar" aria-hidden>
      {showPhoto ? (
        <Image
          src={photoUrl!}
          alt=""
          width={42}
          height={42}
          className="experience-host-avatar__image"
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}
