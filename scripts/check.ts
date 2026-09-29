// npm run check — asserts for the hand-written logic (slugs, @mentions, Cloudinary URLs, Nepali dates).
import assert from 'node:assert/strict'

import { cloudinaryTransform } from '../lib/cloudinary-loader.ts'
import { parseMentions, splitMentions } from '../lib/mentions.ts'
import { bsIso } from '../lib/nepali-date.ts'
import { slugify, transliterate } from '../lib/slug.ts'

// slugs
assert.equal(transliterate('नेपाल'), 'nepal')
assert.equal(transliterate('समाचार'), 'samachar')
assert.equal(transliterate('संसद'), 'sansad')
assert.equal(transliterate('क्रिकेट'), 'kriket')
assert.equal(slugify('काठमाडौंमा भारी वर्षा, २० घर डुबानमा'), 'kathamadaunma-bhari-warsha-20-ghar-dubanama') // ponytail: no schwa deletion mid-word; editors can tweak slugs
assert.equal(slugify('Nepal wins the ACC Cup!'), 'nepal-wins-the-acc-cup')
assert.equal(slugify('नेपाल vs India: T20 सिरिज'), 'nepal-vs-india-t20-sirij')
assert.equal(slugify('!!!'), '')
assert.ok(slugify('क'.repeat(200)).length <= 80)

// @mentions
assert.deepEqual(parseMentions('hi @ram and @Sita_12, @ram again'), ['ram', 'sita_12'])
assert.deepEqual(parseMentions('mail me at ram@gmail.com'), [])
assert.deepEqual(parseMentions('@hari. नमस्ते @shyam.k!'), ['hari', 'shyam.k'])
assert.deepEqual(parseMentions('@@double'), [])
assert.deepEqual(
  splitMentions('hey @ram and @nobody', new Set(['ram'])),
  [{ text: 'hey ' }, { text: '@ram', username: 'ram' }, { text: ' and @nobody' }],
)

// Cloudinary
assert.equal(
  cloudinaryTransform('https://res.cloudinary.com/demo/image/upload/mission-khabar/media/a.jpg', 'w_640'),
  'https://res.cloudinary.com/demo/image/upload/w_640/mission-khabar/media/a.jpg',
)
assert.equal(cloudinaryTransform('/api/media/file/a.jpg', 'w_640'), '/api/media/file/a.jpg')

// Nepali dates (BS), in Nepal time regardless of server timezone
assert.equal(bsIso('2024-04-13T06:00:00Z'), '2081-01-01') // Nepali new year 2081
assert.equal(bsIso('2024-04-12T18:30:00Z'), '2081-01-01') // 00:15 on Apr 13 in Kathmandu
assert.equal(bsIso('2024-04-12T18:00:00Z'), '2080-12-30') // 23:45 on Apr 12 in Kathmandu (Chaitra 2080 has 30 days)

console.log('All checks passed')
