import { defaultImageVariant } from "./images/default";
import { thumbnailVariant } from "./images/thumbnail";

export const variants: Record<string, Record<string, unknown>> = {
    "image": {
      "default": defaultImageVariant,
      "thumbnail": thumbnailVariant
    }
};