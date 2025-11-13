import React from "react";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
  IconComponent: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  isLast?: boolean;
}

export const StepCard: React.FC<StepCardProps> = ({
  number,
  title,
  description,
  IconComponent,
  isLast = false,
}) => (
  <div className="relative bg-card rounded-xl p-8 border border-border shadow-lg flex flex-col gap-6">
    <div className="flex items-center justify-between">
      <IconComponent className="w-12 h-12 text-blue-400" />
      <span className="text-5xl">🐧</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-base flex items-center justify-center font-bold">
        {number}
      </span>
      <h3 className="text-2xl font-semibold">{title}</h3>
    </div>
    <p className="text-base text-muted-foreground leading-relaxed">
      {description}
    </p>

    {!isLast && (
      <div className="hidden md:block absolute top-1/2 right-2 w-15 h-0.5 bg-blue-500/50 z-10" />
    )}
  </div>
);
