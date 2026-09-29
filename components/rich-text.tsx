import { LinkJSXConverter, RichText as PayloadRichText, type JSXConvertersFunction } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import { youtubeId } from '@/lib/youtube'

const facebookSrc = (url: string) => {
  const kind = /\/(videos|reel|watch)\b|fb\.watch/.test(url) ? 'video' : 'post'
  return `https://www.facebook.com/plugins/${kind}.php?href=${encodeURIComponent(url)}&show_text=true&width=560`
}

const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
  ...defaultConverters,
  ...LinkJSXConverter({
    internalDocToHref: ({ linkNode }) => {
      const { relationTo, value } = linkNode.fields.doc ?? {}
      const slug = typeof value === 'object' ? (value as { slug?: string }).slug : ''
      return relationTo === 'articles' ? `/news/${slug}` : `/${slug}`
    },
  }),
  blocks: {
    youtube: ({ node }: { node: { fields: { url: string } } }) => {
      const id = youtubeId(node.fields.url)
      if (!id) return null
      return (
        <iframe
          className="aspect-video"
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title="YouTube video"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    },
    facebook: ({ node }: { node: { fields: { url: string } } }) => (
      <iframe
        className="mx-auto min-h-[420px] max-w-[560px]"
        src={facebookSrc(node.fields.url)}
        title="Facebook post"
        loading="lazy"
        allow="encrypted-media; picture-in-picture"
        allowFullScreen
      />
    ),
  },
})

export function RichText({ data, className }: { data: SerializedEditorState; className?: string }) {
  return <PayloadRichText data={data} converters={converters} className={className} disableContainer={false} />
}
