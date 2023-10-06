import { $PROXY } from "solid-js";
import * as Y from "yjs";

import { ERROR, UNEXPECTED } from "./logHelpers";

type YjsOperation<A extends "set" | "delete" | "insert"> = A extends "set"
  ? { type: "set"; ymap: Y.Map<any> | Y.Doc; key: string; value: any }
  : A extends "delete"
  ? {
      type: "delete";
      yparent: Y.Map<any> | Y.Array<any>;
      key?: string;
      index?: number;
    }
  : A extends "insert"
  ? { type: "insert"; yarray: Y.Array<any>; index: number; content: any[] }
  : never;
const yjsOperations: YjsOperation<"set" | "delete" | "insert">[] = [];
let timeoutId: NodeJS.Timeout | null = null;

const executeYjsOperations = (ydoc: Y.Doc) => {
  if (yjsOperations.length === 0) {
    return;
  }
  console.log("executeYjsOperations", yjsOperations.length);
  if (!ydoc) return;
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    ydoc.transact(() => {
      console.log("ydoc.transact", yjsOperations.length);
      yjsOperations.forEach((op) => {
        switch (op.type) {
          case "set":
            // @ts-ignore - ymap is Yjs Map or Doc
            op.ymap.set(op.key, op.value);
            break;
          case "delete":
            if (op.yparent instanceof Y.Map && op.key) {
              op.yparent.delete(op.key);
            } else if (op.yparent instanceof Y.Array && op.index) {
              op.yparent.delete(op.index);
            }
            break;
          case "insert":
            op.yarray.insert(op.index, op.content);
            break;
          default:
            throw UNEXPECTED();
        }
      });
    });
    yjsOperations.length = 0;
  }, 0);
};

export const setYMapOrDoc = (
  ymap: Y.Map<any> | Y.Doc,
  key: string,
  value: any,
  doc: Y.Doc
) => {
  if (value[$PROXY]) {
    ERROR(["setYMap"], "trying to set a solid-proxy inside a yjs-object");
    return;
  }
  //  TODO: typescript says Y.Doc does not have set
  yjsOperations.push({
    type: "set",
    ymap: ymap,
    key: key,
    value: value,
  });
  executeYjsOperations(doc);
  // ymap.set(key, value);
};

const setYArray = (
  yarray: Y.Array<any>,
  index: number,
  value: any,
  ydoc: Y.Doc
) => {
  if (yarray.length > index) {
    yjsOperations.push({
      type: "delete",
      yparent: yarray,
      index: index,
    });

    // yarray.insert(index, [value]);
    yjsOperations.push({
      type: "insert",
      yarray: yarray,
      index: index,
      content: [value],
    });
    executeYjsOperations(ydoc);
  }
};

export const deleteYValue = (
  yparent: Y.Array<any> | Y.Map<any>,
  keyOrIndex: number | string,
  ydoc: Y.Doc
) => {
  if (yparent instanceof Y.Array && typeof keyOrIndex === "number") {
    // yparent.delete(keyOrIndex);
    yjsOperations.push({
      type: "delete",
      yparent: yparent,
      index: keyOrIndex,
    });
    executeYjsOperations(ydoc);
  } else if (yparent instanceof Y.Map && typeof keyOrIndex === "string") {
    // yparent.delete(keyOrIndex);
    yjsOperations.push({
      type: "delete",
      yparent: yparent,
      key: keyOrIndex,
    });
    executeYjsOperations(ydoc);
  } else {
    UNEXPECTED(yparent, keyOrIndex);
  }
};

export const setYValue = (
  yparent: Y.Array<any> | Y.Map<any> | Y.Doc,
  keyOrIndex: number | string,
  value: any,
  ydoc: Y.Doc
) => {
  if (yparent instanceof Y.Array && typeof keyOrIndex === "number") {
    setYArray(yparent, keyOrIndex, value, ydoc);
  } else if (
    (yparent instanceof Y.Map || yparent instanceof Y.Doc) &&
    typeof keyOrIndex === "string"
  ) {
    setYMapOrDoc(yparent, keyOrIndex, value, ydoc);
  } else {
    UNEXPECTED(yparent, keyOrIndex, value);
  }
};

export const getYValue = (
  yparent: Y.Map<any> | Y.Array<any> | Y.Doc,
  keyOrIndex: string | number
) => {
  if (keyOrIndex === undefined) {
    return yparent;
  } else if (yparent instanceof Y.Array && typeof keyOrIndex === "number") {
    return yparent.get(keyOrIndex);
  } else if (
    (yparent instanceof Y.Map || yparent instanceof Y.Doc) &&
    typeof keyOrIndex === "string"
  ) {
    return yparent.get(keyOrIndex);
  } else {
    UNEXPECTED(yparent, keyOrIndex, yparent[$PROXY]);
  }
};
