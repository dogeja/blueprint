import React from "react";
import { motion, Variants } from "framer-motion";

interface AnimatedContainerProps {
  children: React.ReactNode;
  className?: string;
  animation?:
    | "fadeIn"
    | "slideUp"
    | "slideLeft"
    | "slideRight"
    | "scale"
    | "stagger";
  delay?: number;
  duration?: number;
  staggerChildren?: number;
  whileHover?: boolean;
  whileTap?: boolean;
}

const animations: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  },
};

const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function AnimatedContainer({
  children,
  className = "",
  animation = "fadeIn",
  delay = 0,
  duration = 0.5,
  staggerChildren = 0.1,
  whileHover = false,
  whileTap = false,
}: AnimatedContainerProps) {
  const variants = animations[animation];

  const hoverProps = whileHover ? { whileHover: { scale: 1.02 } } : {};
  const tapProps = whileTap ? { whileTap: { scale: 0.98 } } : {};

  if (animation === "stagger") {
    return (
      <motion.div
        className={className}
        variants={variants}
        initial='hidden'
        animate='visible'
        transition={{ duration, delay }}
        {...hoverProps}
        {...tapProps}
      >
        {React.Children.map(children, (child) => (
          <motion.div variants={staggerItem}>{child}</motion.div>
        ))}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial='hidden'
      animate='visible'
      transition={{ duration, delay }}
      {...hoverProps}
      {...tapProps}
    >
      {children}
    </motion.div>
  );
}

// 특정 애니메이션을 위한 편의 컴포넌트들
export function FadeInContainer({
  children,
  ...props
}: Omit<AnimatedContainerProps, "animation">) {
  return (
    <AnimatedContainer animation='fadeIn' {...props}>
      {children}
    </AnimatedContainer>
  );
}

export function SlideUpContainer({
  children,
  ...props
}: Omit<AnimatedContainerProps, "animation">) {
  return (
    <AnimatedContainer animation='slideUp' {...props}>
      {children}
    </AnimatedContainer>
  );
}

export function StaggerContainer({
  children,
  ...props
}: Omit<AnimatedContainerProps, "animation">) {
  return (
    <AnimatedContainer animation='stagger' {...props}>
      {children}
    </AnimatedContainer>
  );
}
