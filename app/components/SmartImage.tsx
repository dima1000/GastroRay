"use client";

import * as React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  maxVh?: number; // макс. высота в % экрана для портретов (по умолчанию 70)
};

export default function SmartImage({ maxVh = 70, className = "", ...img }: Props) {
  const [portrait, setPortrait] = React.useState<boolean | null>(null);

  return (
    <img
      {...img}
      onLoad={(e) => {
        const nW = e.currentTarget.naturalWidth;
        const nH = e.currentTarget.naturalHeight;
        setPortrait(nH > nW);
      }}
      // Общие размеры: держим соотношение 16:9, но для портретов не обрезаем
      style={{
        aspectRatio: "16 / 9",
        maxHeight: portrait ? `${maxVh}vh` : undefined,
        ...img.style,
      }}
      className={
        [
          "w-full",
          portrait ? "h-auto object-contain bg-slate-100" : "h-full object-cover",
          "rounded-2xl", // скругление как раньше
          className,
        ].join(" ")
      }
    />
  );
}
