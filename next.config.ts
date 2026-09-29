import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Cloudinary resizes/converts (f_auto,q_auto); local /public and /api/media files pass through unchanged.
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
