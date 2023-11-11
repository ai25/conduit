import { $PROXY, batch } from "solid-js";
import {
  createStore,
  produce,
  reconcile,
  SetStoreFunction,
  StoreNode,
  unwrap,
} from "solid-js/store";
import * as Y from "yjs";

import minimumMutationOperations from "./minimumMutationOperations";
import { deleteYValue, getYValue, setYValue } from "./utils/yjsHelpers";

import concat from "./utils/concat";
import { LOG, UNEXPECTED } from "./utils/logHelpers";
import Queue from "./utils/Queue";
import setLeaf from "./utils/setLeaf";

type YMapOrArray = Y.Map<any> | Y.Array<any>;
type YParent = Y.Doc | Y.Array<any> | Y.Map<any>;


const isPrimitive = (value: any) =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean" 

export default function <T extends { [key: string]: any }>(
  ydoc: Y.Doc,
  value: T,
  log: boolean = false
) {
  const [store, setStore] = createStore<T>(value);
  const q = new Queue();
  const observers = new Map<any, any>();

  const optimizeMutationOperations = (
    ops: ReturnType<typeof minimumMutationOperations>,
    yArray: Y.Array<any>
  ) => {
    //  if multiple delete-operations are sequential: bundle them together
    //  p.ex  yparent.delete(0, 1), yparent.delete(1, 1), yparent.delete(2, 1)
    //        => yparent.delete(0, 3)

    const deleted = concat(
      ops.moved.map(({ oldIndex }) => oldIndex),
      ops.deleted
      //  TODO: if ops.dirty is a primitive we should add + delete it
      //        but if it's an object/array we should probably only add + delete it
      //        if we are instantiating the object/array.
      //        if the object/array is already instantiated, we should probably do a more finegrained approach

      //        another possible optimization would be to filter out updates of the children in case one of the ancestors is already dirty
      // ops.dirty
    ).sort((a, b) => b - a);

    log && LOG(["optimizeMutationOperations", "deleted is"], deleted);

    const optimizedDeleted: { index: number; length: number }[] = [];

    deleted.forEach((value, index) => {
      if (index !== 0 && value - deleted[index - 1] === 1) {
        optimizedDeleted[optimizedDeleted.length - 1].length++;
      } else {
        optimizedDeleted.push({
          index: value,
          length: 1,
        });
      }
    });

    //  if multiple add-operations are sequential: bundle them together
    //  p.ex  yparent.insert(0, [value1]), yparent.delete(1, [value2]), yparent.delete(2, [value3])
    //        => yparent.delete(0, [value1, value2, value3])

    const added = concat(
      ops.moved.map(({ newIndex, oldIndex }) => ({
        index: newIndex,
        value: yArray.get(oldIndex),
      })),
      ops.added.map(({ index, value }) => {
        return { index, value: createYjsBranch(value) };
      })
      //  TODO: if ops.dirty is a primitive we should add + delete it
      //        but if it's an object/array we should probably only add + delete it
      //        if we are instantiating the object/array.
      //        if the object/array is already instantiated, we should probably do a more finegrained approach

      //        another possible optimization would be to filter out updates of the children in case one of the ancestors is already dirty
      // ops.dirty.map((index) => {
      //   return { index, value: createYjsBranch(observers.get(yArray)[index]) }
      // })
    ).sort((a, b) => a.index - b.index);

    log && LOG(["optimizeMutationOperations", "added is"], added, ops.added);

    const optimizedAdded: { index: number; values: any[] }[] = [];

    added.forEach(({ value, index }, i) => {
      if (i !== 0 && value.index - added[i - 1].index === 1) {
        optimizedAdded[optimizedAdded.length - 1].values.push(value);
      } else {
        optimizedAdded.push({ index, values: [value] });
      }
    });

    return {
      deleted: optimizedDeleted,
      added: optimizedAdded,
    };
  };

  const createYjsBranch = (svalue: any) => {
    log && LOG(["createYjsBranch"], svalue);

    if (isPrimitive(svalue)) {
      return svalue;
    } else if (Array.isArray(svalue)) {
      const values = svalue.map((value) => createYjsBranch(value));
      const yArray = new Y.Array();
      setObserver(yArray, svalue);
      yArray.insert(0, values);
      return yArray;
    } else if (typeof svalue === "object") {
      const entries: [key: string, value: any][] = Object.entries(svalue).map(
        ([key, value]) => {
          const yvalue = createYjsBranch(value);
          return [key, yvalue];
        }
      );
      const ymap = new Y.Map(entries);
      setObserver(ymap, svalue);
      return ymap;
    } else {
      UNEXPECTED(svalue,"svalue is not primitive, array or object");
    }
  };

  const solidToYjs = (
    yparent: Y.Map<any> | Y.Array<any> | Y.Doc,
    sparent: any,
    key: string | number,
    newValue: any
  ) => {
    log && LOG(["solidToYjs"], yparent, sparent, key, newValue);

    if (!sparent) {
      UNEXPECTED("sparent is undefined");
      return false;
    }

    if (!yparent) {
      UNEXPECTED("yparent is undefined", sparent);
      return false;
    }

    if (isPrimitive(newValue)) {
      setYValue(yparent, key, newValue, ydoc);
    } else if (newValue === undefined && yparent instanceof Y.Map) {
      // in solid setting undefined in setStore -> remove the key
      deleteYValue(yparent, key, ydoc);
    } else if (Array.isArray(newValue)) {
      solidArrayToYjs(yparent, sparent, key, newValue);
    } else if (typeof newValue === "object") {
      solidObjectToYjs(yparent, sparent, key, newValue);
    }
  };

  const solidArrayToYjs = (
    yparent: Y.Map<any> | Y.Array<any> | Y.Doc,
    sparent: any,
    key: string | number,
    newValue: any
  ) => {
    if (key && !(key in sparent)) setLeaf(sparent)(key, []);

    const svalue = sparent[key];
    let yvalue = getYValue(yparent, key);

    if (!yvalue) {
      yvalue = new Y.Array();
      setYValue(yparent, key, yvalue, ydoc);
    }
    if (!(yvalue instanceof Y.Array)) {
      UNEXPECTED(yvalue);
      return;
    }

    // TODO:  we compare oldSArray instead of yArray so we can do shallow checks.
    //        but i am not a 100% sure svalue will always gonna be defined when yvalue is defined.

    const ops = minimumMutationOperations(svalue, newValue, dirty.get(svalue));
    log && LOG(["minimumMutationOperations"], ops);
    // ops.dirty = Array.from(dirty.get(svalue) || []).map((index) => +index)

    const { deleted, added } = optimizeMutationOperations(ops, yvalue);

    log && LOG(["solidArrayToYjs"], ops);

    yvalue.doc?.transact(() => {
      deleted.forEach(({ index, length }) => yvalue.delete(index, length));
      added.forEach(({ index, values }) => yvalue.insert(index, values));
    });

    if (newValue.length < yvalue.length)
      yvalue.delete(newValue.length, yvalue.length - newValue.length);
  };

  const solidObjectToYjs = (
    yparent: Y.Map<any> | Y.Array<any> | Y.Doc,
    sparent: any,
    key: string | number,
    newValue: any
  ) => {
    if (key && !(key in sparent)) setLeaf(sparent)(key, {});

    const svalue = key ? sparent[key] : sparent;
    let yvalue = getYValue(yparent, key);

    if (!yvalue) {
      yvalue = new Y.Map();
      setYValue(yparent, key, yvalue, ydoc);

      Object.entries(newValue).forEach(([key2, value2]) => {
        if (value === undefined) {
          UNEXPECTED();
        } else if (isPrimitive(value2)) {
          setYValue(yvalue, key2, value2, ydoc);
        } else {
          if (!(key2 in svalue))
            setLeaf(svalue)(key2, Array.isArray(value2) ? [] : {});
          solidToYjs(yvalue, svalue[key2], key2, value2);
        }
      });
      return;
    }

    if (yvalue instanceof Y.Map) {
      //  TODO
      //  solid's stores does a shallow merge on objects
      //  https://www.solidjs.com/docs/latest/api#createstore : 'Objects are always shallowly merged.'
      //  since we are only checking the path, inconsistencies might arise when a signal gets shallowly merged
      //  so that it has mutliple entry-paths in a store

      log &&
        console.info(
          `be careful: when setting an object in a store, the object gets shallowly merged
(see https://www.solidjs.com/docs/latest/api#createstore).
This can possibly create multiple entry-points of the same reactive value in a store:

const [store, setStore] = createStore({firstEntryPoint: "ok"});
setStore({secondEntryPoint: store.firstEntryPoint});

=> store.secondEntryPoint points at store.firstEntryPoint.

Multiple entry-points are currently not supported in yjsStore.`
        );

      if (!svalue) setLeaf(sparent)(key, {});

      Object.entries(newValue).forEach(([key2, value2]) =>
        solidToYjs(yvalue, svalue, key2, value2)
      );
      return;
    }
    UNEXPECTED(yvalue);
  };

  const getKeysToUpdateFromTransaction = (transaction: Y.Transaction) => {
    // TODO: this is pretty hacky lol
    return Object.values(Object.fromEntries(transaction.changed))
      .map((set) => Array.from(set) as (string | number)[])
      .flat();
  };

  const setObserver = (yparent: YMapOrArray, sparent: any) => {
    if (yparent instanceof Y.Array) {
      yparent.observe((event) =>
        batch(() => {
          if (event.transaction.local) return;
          let index = 0;
          event.changes.delta.forEach((delta) => {
            if (delta.retain) {
              index += delta.retain;
            } else if (delta.insert) {
              const insert = Array.isArray(delta.insert)
                ? delta.insert.map((yvalue) =>
                    typeof yvalue === "object" ? yvalue.toJSON() : yvalue
                  )
                : [delta.insert];

              q.add(() => {
                setLeaf(sparent)((sparent) => [
                  ...sparent.slice(0, index),
                  ...insert,
                  ...sparent.slice(index, sparent.length),
                ]);
                index += insert.length;
                iterateObservers(yparent, sparent);
              });
            } else if (delta.delete) {
              q.add(() => {
                setLeaf(sparent)((sparent) => [
                  ...sparent.slice(0, index),
                  ...sparent.slice(index + delta.delete!, sparent.length),
                ]);
              });
            }
          });
        })
      );
    } else {
      yparent.observe((event) =>
        batch(() => {
          event.keysChanged.forEach((keyToUpdate) => {
            const yvalueToUpdate = getYValue(yparent, keyToUpdate);
            if (!keyToUpdate) {
              UNEXPECTED("keyToUpdate is null", keyToUpdate);
              return;
            }
            if (!yvalueToUpdate && keyToUpdate in sparent) {
              q.add(() => setLeaf(sparent)(keyToUpdate, undefined));
            } else if (
              yvalueToUpdate instanceof Y.Array ||
              yvalueToUpdate instanceof Y.Map
            ) {
              q.add(() => {
                setLeaf(sparent)(
                  keyToUpdate,
                  reconcile(yvalueToUpdate.toJSON())
                );
                setObserver(yvalueToUpdate, sparent[keyToUpdate]);
                iterateObservers(yvalueToUpdate, sparent[keyToUpdate]);
              });
            } else {
              q.add(() => setLeaf(sparent)(keyToUpdate, yvalueToUpdate));
            }
          });
        })
      );
    }

    observers.set(sparent, yparent);
    observers.set(yparent, sparent);
  };

  const iterateObservers = (
    yparent: Y.Map<any> | Y.Array<any>,
    sparent: any
  ) => {
    if (!(yparent instanceof Y.Map || yparent instanceof Y.Array)) {
      UNEXPECTED(yparent, sparent);
      return;
    }
    yparent.forEach((yvalue, key) => {
      if (yvalue instanceof Y.Map || yvalue instanceof Y.Array) {
        if (!sparent[key]) {
          setLeaf(sparent)(key, Array.isArray(value) ? [] : {});
        }
        setObserver(yvalue, sparent[key]);
        iterateObservers(yvalue, sparent[key]);
      }
    });
  };

  //  proxy for produce-function
  //  interpolated from https://github.com/solidjs/solid/blob/main/packages/solid/store/src/modifiers.ts line 130
  //  TODO: proxy for produce is broken.
  const producers = new WeakMap();
  const dirty = new Map<any, Set<string | number>>();
  const setterTraps: ProxyHandler<StoreNode> = {
    get(target, property): any {
      log && console.log("property", property);
      if (property === $PROXY) return target;
      const value = target[property];
      if (property === "unshift") {
        return target[$PROXY].unshift;
        console.log("unshift!");
      }
      let proxy;
      return value?.[$PROXY]
        ? producers.get(value) ||
            (producers.set(value, (proxy = new Proxy(value, setterTraps))),
            proxy)
        : value;
    },

    set(target, property, value) {
      if (typeof property === "string" && !isNaN(+property)) {
        if (!dirty.get(target)) {
          dirty.set(target, new Set());
        }
        dirty.get(target)!.add(Array.isArray(target) ? +property : property);
      }

      return true;
    },

    deleteProperty(target, property) {
      // setProperty(target, property, undefined, true)
      return true;
    },
  };

  const _setStore: SetStoreFunction<typeof store> = function (...args: any) {
    const clonedArgs = [...args];

    let nextValueTemplate = args.pop();
    let key = args.pop();

    type TreeNode = {
      sparent: any;
      yparent: Y.Doc | Y.Array<any> | Y.Map<any>;
      key: string;
    };

    let tree: TreeNode[][] = [[{ sparent: store, yparent: ydoc, key: "" }]];

    while (args.length > 0) {
      const nextArg = (
        args as (number | string | boolean | ((state: any) => boolean))[]
      ).shift()!;
      const currentLayer = tree[tree.length - 1];

      LOG(["_setStore", "currentLayer"], currentLayer);
      const nextLayer: TreeNode[] = [];
      //  filter functions inside store
      //  see https://www.solidjs.com/docs/latest/api#updating-stores
      if (typeof nextArg === "function") {
        currentLayer.forEach(({ sparent, yparent }) => {
          if (Array.isArray(sparent) && yparent instanceof Y.Array) {
            const filtered = sparent
              .map((element, index) => [element, index])
              .filter(([element]) => nextArg(element))
              .map(([svalue, index]) => ({
                sparent: svalue,
                yparent: yparent.get(index),
                key: nextArg.toString(),
              }));
            nextLayer.push(...filtered);
          } else {
            console.warn(yparent, sparent, nextArg);
            UNEXPECTED(sparent, yparent);
          }
        });
      } else {
        currentLayer.forEach(({ sparent, yparent }) => {
        const nextSparent = sparent[nextArg as keyof typeof sparent] 
        let nextYparent = 'get' in yparent ? yparent.get(nextArg) : undefined;
          if (!nextYparent) {
            console.log("nextYparent is undefined", yparent, nextArg);
            yparent = createYjsBranch(sparent);
            nextYparent = yparent.get(nextArg);
            console.log("nextYparent is now", nextYparent, yparent);
          }
          console.log("nextSparent", nextSparent, nextYparent);
        if (nextSparent !== undefined && nextYparent) {
          nextLayer.push({
            sparent: nextSparent,
            yparent: nextYparent as YParent,
            key: nextArg.toString(),
          });
          }else {
          console.warn('Failed to access sparent or yparent with key:', nextArg, typeof nextSparent);
          UNEXPECTED();
        }
        });
      }
      tree.push(nextLayer);
    }

    log && console.log("THIS IS HAPPENING");

    tree[tree.length - 1].forEach(({ sparent, yparent }) => {
      let nextValue = nextValueTemplate;
      console.log("nextValue", nextValue, yparent, sparent);

      if (typeof nextValue === "function") {
        //  TODO: figure out a less hacky way to figure out if it is a produce-function or not
        const produceToString = produce(() => {})
          .toString()
          .replace(/\s/g, "");
        const nextValueToString = nextValue.toString().replace(/\s/g, "");

        if (nextValueToString === produceToString) {
          // TODO:  produce is pretty broken atm: look at unshift.

          //  if produce: pass a mutable proxy to the function
          //  dirty is a map that keeps track of all the elements that are being mutated
          dirty.clear();
          let proxy;
          producers.set(
            sparent as Record<keyof T, T[keyof T]>,
            (proxy = new Proxy(sparent[key] as Extract<T, object>, setterTraps))
          );
          nextValue(proxy);
          log && console.log("PROXY is ", proxy, proxy[$PROXY]);
          // solidToYjs(yparent, sparent, key, nextValue)

          Array.from(dirty.entries()).forEach(([svalue, properties]) => {
            const yvalue = observers.get(svalue);
            properties.forEach((property) => {
              log && console.log(yparent, svalue, property, svalue[property]);
              solidToYjs(yvalue, svalue, property, svalue[property]);
            });
          });
          setLeaf(sparent)(key, reconcile(proxy[$PROXY]));
        } else {
          //  set nextValue as the result of the function
          nextValue = nextValue(sparent[key]);
          solidToYjs(yparent, sparent, key, nextValue);
          setLeaf(sparent)(key, nextValue);
          if (!(yparent instanceof Y.Doc)) iterateObservers(yparent, sparent);
        }
      } else {
        solidToYjs(yparent, sparent, key, nextValue);
        setLeaf(sparent)(key, nextValue);
      }
    });
  };

  Object.entries(value).forEach(([key, value]) => {
    if (typeof value === "object") {
      const array = Array.isArray(value)
        ? ydoc.getArray(key)
        : ydoc.getMap(key);
      setObserver(array, store[key]);
      iterateObservers(array, store[key]);
    } else {
      console.error("currently only arrays and objects are allowed");
    }
  });

  return [store, _setStore] as const;
}
