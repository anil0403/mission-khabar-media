import path from 'path'
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary'
import type { Adapter } from '@payloadcms/plugin-cloud-storage/types'

// Payload media → Cloudinary. The Cloudinary public_id is derived from the (already unique) Payload
// filename, so no extra fields are needed: mission-khabar/<collection>/<name-without-ext>.
const FOLDER = 'mission-khabar'

const publicId = (collection: string, filename: string) =>
  `${FOLDER}/${collection}/${path.parse(filename).name}`

export const cloudinaryAdapter: Adapter = ({ collection }) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
    url_analytics: false, // no ?_a= tracking param on image URLs
  })
  const url = (filename: string) =>
    cloudinary.url(publicId(collection.slug, filename), { secure: true, format: path.extname(filename).slice(1) || undefined })

  return {
    name: 'cloudinary',
    generateURL: ({ filename }) => url(filename),
    handleUpload: async ({ file }) => {
      await new Promise<UploadApiResponse | undefined>((resolve, reject) =>
        cloudinary.uploader
          .upload_stream({ public_id: publicId(collection.slug, file.filename), resource_type: 'image', overwrite: true }, (err, res) =>
            err ? reject(err) : resolve(res),
          )
          .end(file.buffer),
      )
    },
    handleDelete: async ({ filename }) => {
      await cloudinary.uploader.destroy(publicId(collection.slug, filename), { resource_type: 'image', invalidate: true })
    },
    // Only hit when something requests /api/media/file/<name>; send it to the CDN.
    staticHandler: (_req, { params }) => Response.redirect(url(params.filename), 302),
  }
}
