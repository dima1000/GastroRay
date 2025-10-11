"use client";

import * as React from "react";

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  maxVh?: number; // высота для портретов: 60–80vh обычно
};

export default function SmartImage({ maxVh = 70, className = "", style, ...img }: Props) {
  const [isPortrait, setIsPortrait] = React.useState<boolean | null>(null);

  return (
    <img
      {...img}
      onLoad={(e) => {
        const el = e.currentTarget;
        setIsPortrait(el.naturalHeight > el.naturalWidth);
      }}
      // ВАЖНО: картинка сама задаёт высоту
      style={{
        display: "block",
        width: "100%",
        height: "auto",
        // Для альбомных добавим aspect-ratio, для портретных ограничим высоту
        ...(isPortrait === false ? { aspectRatio: "16 / 9" } : null),
        ...(isPortrait ? { maxHeight: `${maxVh}vh` } : null),
        ...style,
      }}
      className={[
        // Для портретов показываем целиком, для альбомных — заполняем блок
        isPortrait ? "object-contain bg-slate-100" : "object-cover",
        "rounded-2xl", // общий стиль
        className,
      ].join(" ")}
    />
  );
}
