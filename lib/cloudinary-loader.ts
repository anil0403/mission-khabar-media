// next/image loader: let Cloudinary resize + pick format. Non-Cloudinary src is returned as-is.
export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return cloudinaryTransform(src, `f_auto,q_${quality ?? 'auto'},c_limit,w_${width}`)
}

export function cloudinaryTransform(src: string, transform: string) {
  if (!src.includes('res.cloudinary.com') || !src.includes('/upload/')) return src
  return src.replace('/upload/', `/upload/${transform}/`)
}
