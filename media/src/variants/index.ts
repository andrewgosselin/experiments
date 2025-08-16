import { defaultImageVariant } from "./images/default";
import { thumbnailVariant } from "./images/thumbnail";
import { ImageVariantConfig } from "./images/types";

export const variants: Record<string, Record<string, ImageVariantConfig>> = {
    "image": {
      "default": defaultImageVariant,
      "thumbnail": thumbnailVariant
    }
};