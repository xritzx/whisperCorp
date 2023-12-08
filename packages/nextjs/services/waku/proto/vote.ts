/* eslint-disable import/export */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-unnecessary-boolean-literal-compare */
/* eslint-disable @typescript-eslint/no-empty-interface */

import { type Codec, decodeMessage, encodeMessage, message } from 'protons-runtime'
import type { Uint8ArrayList } from 'uint8arraylist'

export interface Vote {
  isUpvote: boolean
  timestamp: bigint
  cId: string
  userSignature: string
}

export namespace Vote {
  let _codec: Codec<Vote>

  export const codec = (): Codec<Vote> => {
    if (_codec == null) {
      _codec = message<Vote>((obj, w, opts = {}) => {
        if (opts.lengthDelimited !== false) {
          w.fork()
        }

        if ((obj.isUpvote != null && obj.isUpvote !== false)) {
          w.uint32(8)
          w.bool(obj.isUpvote)
        }

        if ((obj.timestamp != null && obj.timestamp !== 0n)) {
          w.uint32(16)
          w.uint64(obj.timestamp)
        }

        if ((obj.cId != null && obj.cId !== '')) {
          w.uint32(26)
          w.string(obj.cId)
        }

        if ((obj.userSignature != null && obj.userSignature !== '')) {
          w.uint32(34)
          w.string(obj.userSignature)
        }

        if (opts.lengthDelimited !== false) {
          w.ldelim()
        }
      }, (reader, length) => {
        const obj: any = {
          isUpvote: false,
          timestamp: 0n,
          cId: '',
          userSignature: ''
        }

        const end = length == null ? reader.len : reader.pos + length

        while (reader.pos < end) {
          const tag = reader.uint32()

          switch (tag >>> 3) {
            case 1: {
              obj.isUpvote = reader.bool()
              break
            }
            case 2: {
              obj.timestamp = reader.uint64()
              break
            }
            case 3: {
              obj.cId = reader.string()
              break
            }
            case 4: {
              obj.userSignature = reader.string()
              break
            }
            default: {
              reader.skipType(tag & 7)
              break
            }
          }
        }

        return obj
      })
    }

    return _codec
  }

  export const encode = (obj: Partial<Vote>): Uint8Array => {
    return encodeMessage(obj, Vote.codec())
  }

  export const decode = (buf: Uint8Array | Uint8ArrayList): Vote => {
    return decodeMessage(buf, Vote.codec())
  }
}
