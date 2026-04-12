import { Badge } from "@/components/ui/badge";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="flex max-w-2xl flex-col gap-4">
      <Badge variant="outline" className="w-fit rounded-full px-3 py-1">
        {eyebrow}
      </Badge>
      <div className="space-y-3">
        <h2 className="font-heading text-3xl leading-tight text-foreground md:text-4xl">
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}
