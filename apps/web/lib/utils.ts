import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know our custom text-size tokens (text-ui-sm, ...) are
 * font-size, not text-color — otherwise it drops `text-white`/`text-dark`
 * when a size utility is present.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "ui-2xs",
            "ui-xs",
            "ui-sm",
            "ui-md",
            "ui-lg",
            "ui-xl",
            "mono-sm",
            "mono-md",
            "mono-lg",
            "display-sm",
            "display-md",
            "display-lg",
            "display-xl",
            "marketing-hero",
            "marketing-xl",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
