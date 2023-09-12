import { $PROXY } from 'solid-js'
import * as Y from 'yjs'

import { ERROR, UNEXPECTED } from './logHelpers'

export const setYMapOrDoc = (
  ymap: Y.Map<any> | Y.Doc,
  key: string,
  value: any
) => {
  if (value[$PROXY]) {
    ERROR(['setYMap'], 'trying to set a solid-proxy inside a yjs-object')
    return
  }
  //  TODO: typescript says Y.Doc does not have set
  ymap.set(key, value)
}

const setYArray = (yarray: Y.Array<any>, index: number, value: any) => {
  if (yarray.length > index) yarray.delete(index)
  yarray.insert(index, [value])
}

export const setYValue = (
  yparent: Y.Array<any> | Y.Map<any> | Y.Doc,
  keyOrIndex: number | string,
  value: any
) => {
  if (yparent instanceof Y.Array && typeof keyOrIndex === 'number') {
    setYArray(yparent, keyOrIndex, value)
  } else if (
    (yparent instanceof Y.Map || yparent instanceof Y.Doc) &&
    typeof keyOrIndex === 'string'
  ) {
    setYMapOrDoc(yparent, keyOrIndex, value)
  } else {
    UNEXPECTED(yparent, keyOrIndex, value)
  }
}

export const deleteYValue = (
  yparent: Y.Array<any> | Y.Map<any>,
  keyOrIndex: number | string
) => {
  if (yparent instanceof Y.Array && typeof keyOrIndex === 'number') {
    yparent.delete(keyOrIndex)
  } else if (yparent instanceof Y.Map && typeof keyOrIndex === 'string') {
    yparent.delete(keyOrIndex)
  } else {
    UNEXPECTED(yparent, keyOrIndex)
  }
}

export const getYValue = (
  yparent: Y.Map<any> | Y.Array<any> | Y.Doc,
  keyOrIndex: string | number
) => {
  if (keyOrIndex === undefined) {
    return yparent
  } else if (yparent instanceof Y.Array && typeof keyOrIndex === 'number') {
    return yparent.get(keyOrIndex)
  } else if (
    (yparent instanceof Y.Map || yparent instanceof Y.Doc) &&
    typeof keyOrIndex === 'string'
  ) {
    return yparent.get(keyOrIndex)
  } else {
    UNEXPECTED(yparent, keyOrIndex, yparent[$PROXY])
  }
}
