import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("button", {
  variants: {
    variant: {
      coral: "button-coral",
      outline: "button-outline",
      light: "button-light"
    }
  },
  defaultVariants: {
    variant: "coral"
  }
});

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant,
  asChild = false,
  type = "button",
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant }), className);

  if (asChild) {
    return <Slot className={classes} {...props} />;
  }

  return <button className={classes} type={type} {...props} />;
}

export { Button, buttonVariants };
export type { ButtonProps };
