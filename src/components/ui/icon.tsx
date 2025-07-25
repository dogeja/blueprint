import React from "react";
import { LucideIcon } from "lucide-react";

interface IconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
}

// React.memo를 사용하여 불필요한 리렌더링 방지
export const Icon = React.memo<IconProps>(
  ({ icon: IconComponent, size = 24, className = "" }) => {
    return <IconComponent size={size} className={className} />;
  }
);

Icon.displayName = "Icon";
