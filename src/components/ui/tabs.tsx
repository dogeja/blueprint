"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(value || "");

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      [onValueChange]
    );

    const contextValue = React.useMemo(
      () => ({
        value: value || internalValue,
        onValueChange: handleValueChange,
      }),
      [value, internalValue, handleValueChange]
    );

    return (
      <TabsContext.Provider value={contextValue}>
        <div ref={ref} className={className} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
Tabs.displayName = "Tabs";

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) {
      throw new Error("TabsTrigger must be used within Tabs");
    }

    const isActive = context.value === value;

    const handleClick = React.useCallback(() => {
      context.onValueChange(value);
      onClick?.();
    }, [context, value, onClick]);

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
          isActive && "bg-background text-foreground shadow-sm",
          className
        )}
        onClick={handleClick}
        data-state={isActive ? "active" : "inactive"}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (!context) {
      throw new Error("TabsContent must be used within Tabs");
    }

    const isActive = context.value === value;

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
