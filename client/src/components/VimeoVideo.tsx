import React from "react";

interface VimeoVideoProps {
  videoId?: string; // e.g. 123456789
  title?: string;
  className?: string;
}

// بسيط: مكوّن فيديو فيميو وهمي حالياً. استبدله لاحقاً بتضمين حقيقي عبر iframe.
export const VimeoVideo: React.FC<VimeoVideoProps> = ({ videoId, title, className }) => {
  return (
    <div className={className ?? "w-full aspect-video flex items-center justify-center bg-muted rounded-md border"}>
      <span className="text-sm text-gray-600">
        {title || "فيديو توضيحي"} {videoId ? `(Vimeo ID: ${videoId})` : "— سيتم الإضافة لاحقاً"}
      </span>
    </div>
  );
};

export default VimeoVideo;
