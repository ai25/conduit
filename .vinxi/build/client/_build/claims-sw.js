try {
  self["workbox:core:7.0.0"] && _();
} catch {
}
const i = (() => {
  "__WB_DISABLE_DEV_LOGS" in globalThis || (self.__WB_DISABLE_DEV_LOGS = !1);
  let s = !1;
  const e = {
    debug: "#7f8c8d",
    log: "#2ecc71",
    warn: "#f39c12",
    error: "#c0392b",
    groupCollapsed: "#3498db",
    groupEnd: null
    // No colored prefix on groupEnd
  }, t = function(n, o) {
    if (self.__WB_DISABLE_DEV_LOGS)
      return;
    if (n === "groupCollapsed" && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      console[n](...o);
      return;
    }
    const c = [
      `background: ${e[n]}`,
      "border-radius: 0.5em",
      "color: white",
      "font-weight: bold",
      "padding: 2px 0.5em"
    ], l = s ? [] : ["%cworkbox", c.join(";")];
    console[n](...l, ...o), n === "groupCollapsed" && (s = !0), n === "groupEnd" && (s = !1);
  }, r = {}, a = Object.keys(e);
  for (const n of a) {
    const o = n;
    r[o] = (...c) => {
      t(o, c);
    };
  }
  return r;
})(), te = {
  "invalid-value": ({ paramName: s, validValueDescription: e, value: t }) => {
    if (!s || !e)
      throw new Error("Unexpected input to 'invalid-value' error.");
    return `The '${s}' parameter was given a value with an unexpected value. ${e} Received a value of ${JSON.stringify(t)}.`;
  },
  "not-an-array": ({ moduleName: s, className: e, funcName: t, paramName: r }) => {
    if (!s || !e || !t || !r)
      throw new Error("Unexpected input to 'not-an-array' error.");
    return `The parameter '${r}' passed into '${s}.${e}.${t}()' must be an array.`;
  },
  "incorrect-type": ({ expectedType: s, paramName: e, moduleName: t, className: r, funcName: a }) => {
    if (!s || !e || !t || !a)
      throw new Error("Unexpected input to 'incorrect-type' error.");
    const n = r ? `${r}.` : "";
    return `The parameter '${e}' passed into '${t}.${n}${a}()' must be of type ${s}.`;
  },
  "incorrect-class": ({ expectedClassName: s, paramName: e, moduleName: t, className: r, funcName: a, isReturnValueProblem: n }) => {
    if (!s || !t || !a)
      throw new Error("Unexpected input to 'incorrect-class' error.");
    const o = r ? `${r}.` : "";
    return n ? `The return value from '${t}.${o}${a}()' must be an instance of class ${s}.` : `The parameter '${e}' passed into '${t}.${o}${a}()' must be an instance of class ${s}.`;
  },
  "missing-a-method": ({ expectedMethod: s, paramName: e, moduleName: t, className: r, funcName: a }) => {
    if (!s || !e || !t || !r || !a)
      throw new Error("Unexpected input to 'missing-a-method' error.");
    return `${t}.${r}.${a}() expected the '${e}' parameter to expose a '${s}' method.`;
  },
  "add-to-cache-list-unexpected-type": ({ entry: s }) => `An unexpected entry was passed to 'workbox-precaching.PrecacheController.addToCacheList()' The entry '${JSON.stringify(s)}' isn't supported. You must supply an array of strings with one or more characters, objects with a url property or Request objects.`,
  "add-to-cache-list-conflicting-entries": ({ firstEntry: s, secondEntry: e }) => {
    if (!s || !e)
      throw new Error("Unexpected input to 'add-to-cache-list-duplicate-entries' error.");
    return `Two of the entries passed to 'workbox-precaching.PrecacheController.addToCacheList()' had the URL ${s} but different revision details. Workbox is unable to cache and version the asset correctly. Please remove one of the entries.`;
  },
  "plugin-error-request-will-fetch": ({ thrownErrorMessage: s }) => {
    if (!s)
      throw new Error("Unexpected input to 'plugin-error-request-will-fetch', error.");
    return `An error was thrown by a plugins 'requestWillFetch()' method. The thrown error message was: '${s}'.`;
  },
  "invalid-cache-name": ({ cacheNameId: s, value: e }) => {
    if (!s)
      throw new Error("Expected a 'cacheNameId' for error 'invalid-cache-name'");
    return `You must provide a name containing at least one character for setCacheDetails({${s}: '...'}). Received a value of '${JSON.stringify(e)}'`;
  },
  "unregister-route-but-not-found-with-method": ({ method: s }) => {
    if (!s)
      throw new Error("Unexpected input to 'unregister-route-but-not-found-with-method' error.");
    return `The route you're trying to unregister was not  previously registered for the method type '${s}'.`;
  },
  "unregister-route-route-not-registered": () => "The route you're trying to unregister was not previously registered.",
  "queue-replay-failed": ({ name: s }) => `Replaying the background sync queue '${s}' failed.`,
  "duplicate-queue-name": ({ name: s }) => `The Queue name '${s}' is already being used. All instances of backgroundSync.Queue must be given unique names.`,
  "expired-test-without-max-age": ({ methodName: s, paramName: e }) => `The '${s}()' method can only be used when the '${e}' is used in the constructor.`,
  "unsupported-route-type": ({ moduleName: s, className: e, funcName: t, paramName: r }) => `The supplied '${r}' parameter was an unsupported type. Please check the docs for ${s}.${e}.${t} for valid input types.`,
  "not-array-of-class": ({ value: s, expectedClass: e, moduleName: t, className: r, funcName: a, paramName: n }) => `The supplied '${n}' parameter must be an array of '${e}' objects. Received '${JSON.stringify(s)},'. Please check the call to ${t}.${r}.${a}() to fix the issue.`,
  "max-entries-or-age-required": ({ moduleName: s, className: e, funcName: t }) => `You must define either config.maxEntries or config.maxAgeSecondsin ${s}.${e}.${t}`,
  "statuses-or-headers-required": ({ moduleName: s, className: e, funcName: t }) => `You must define either config.statuses or config.headersin ${s}.${e}.${t}`,
  "invalid-string": ({ moduleName: s, funcName: e, paramName: t }) => {
    if (!t || !s || !e)
      throw new Error("Unexpected input to 'invalid-string' error.");
    return `When using strings, the '${t}' parameter must start with 'http' (for cross-origin matches) or '/' (for same-origin matches). Please see the docs for ${s}.${e}() for more info.`;
  },
  "channel-name-required": () => "You must provide a channelName to construct a BroadcastCacheUpdate instance.",
  "invalid-responses-are-same-args": () => "The arguments passed into responsesAreSame() appear to be invalid. Please ensure valid Responses are used.",
  "expire-custom-caches-only": () => "You must provide a 'cacheName' property when using the expiration plugin with a runtime caching strategy.",
  "unit-must-be-bytes": ({ normalizedRangeHeader: s }) => {
    if (!s)
      throw new Error("Unexpected input to 'unit-must-be-bytes' error.");
    return `The 'unit' portion of the Range header must be set to 'bytes'. The Range header provided was "${s}"`;
  },
  "single-range-only": ({ normalizedRangeHeader: s }) => {
    if (!s)
      throw new Error("Unexpected input to 'single-range-only' error.");
    return `Multiple ranges are not supported. Please use a  single start value, and optional end value. The Range header provided was "${s}"`;
  },
  "invalid-range-values": ({ normalizedRangeHeader: s }) => {
    if (!s)
      throw new Error("Unexpected input to 'invalid-range-values' error.");
    return `The Range header is missing both start and end values. At least one of those values is needed. The Range header provided was "${s}"`;
  },
  "no-range-header": () => "No Range header was found in the Request provided.",
  "range-not-satisfiable": ({ size: s, start: e, end: t }) => `The start (${e}) and end (${t}) values in the Range are not satisfiable by the cached response, which is ${s} bytes.`,
  "attempt-to-cache-non-get-request": ({ url: s, method: e }) => `Unable to cache '${s}' because it is a '${e}' request and only 'GET' requests can be cached.`,
  "cache-put-with-no-response": ({ url: s }) => `There was an attempt to cache '${s}' but the response was not defined.`,
  "no-response": ({ url: s, error: e }) => {
    let t = `The strategy could not generate a response for '${s}'.`;
    return e && (t += ` The underlying error is ${e}.`), t;
  },
  "bad-precaching-response": ({ url: s, status: e }) => `The precaching request for '${s}' failed` + (e ? ` with an HTTP status of ${e}.` : "."),
  "non-precached-url": ({ url: s }) => `createHandlerBoundToURL('${s}') was called, but that URL is not precached. Please pass in a URL that is precached instead.`,
  "add-to-cache-list-conflicting-integrities": ({ url: s }) => `Two of the entries passed to 'workbox-precaching.PrecacheController.addToCacheList()' had the URL ${s} with different integrity values. Please remove one of them.`,
  "missing-precache-entry": ({ cacheName: s, url: e }) => `Unable to find a precached response in ${s} for ${e}.`,
  "cross-origin-copy-response": ({ origin: s }) => `workbox-core.copyResponse() can only be used with same-origin responses. It was passed a response with origin ${s}.`,
  "opaque-streams-source": ({ type: s }) => {
    const e = `One of the workbox-streams sources resulted in an '${s}' response.`;
    return s === "opaqueredirect" ? `${e} Please do not use a navigation request that results in a redirect as a source.` : `${e} Please ensure your sources are CORS-enabled.`;
  }
}, se = (s, e = {}) => {
  const t = te[s];
  if (!t)
    throw new Error(`Unable to find message for code '${s}'.`);
  return t(e);
}, re = se;
class u extends Error {
  /**
   *
   * @param {string} errorCode The error code that
   * identifies this particular error.
   * @param {Object=} details Any relevant arguments
   * that will help developers identify issues should
   * be added as a key on the context object.
   */
  constructor(e, t) {
    const r = re(e, t);
    super(r), this.name = e, this.details = t;
  }
}
const ae = (s, e) => {
  if (!Array.isArray(s))
    throw new u("not-an-array", e);
}, ne = (s, e, t) => {
  if (typeof s[e] !== "function")
    throw t.expectedMethod = e, new u("missing-a-method", t);
}, oe = (s, e, t) => {
  if (typeof s !== e)
    throw t.expectedType = e, new u("incorrect-type", t);
}, ie = (s, e, t) => {
  if (!(s instanceof e))
    throw t.expectedClassName = e.name, new u("incorrect-class", t);
}, ce = (s, e, t) => {
  if (!e.includes(s))
    throw t.validValueDescription = `Valid values are ${JSON.stringify(e)}.`, new u("invalid-value", t);
}, le = (s, e, t) => {
  const r = new u("not-array-of-class", t);
  if (!Array.isArray(s))
    throw r;
  for (const a of s)
    if (!(a instanceof e))
      throw r;
}, h = {
  hasMethod: ne,
  isArray: ae,
  isInstance: ie,
  isOneOf: ce,
  isType: oe,
  isArrayOfClass: le
}, P = /* @__PURE__ */ new Set();
function he(s) {
  h.isType(s, "function", {
    moduleName: "workbox-core",
    funcName: "register",
    paramName: "callback"
  }), P.add(s), i.log("Registered a callback to respond to quota errors.", s);
}
const m = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, k = (s) => [m.prefix, s, m.suffix].filter((e) => e && e.length > 0).join("-"), ue = (s) => {
  for (const e of Object.keys(m))
    s(e);
}, E = {
  updateDetails: (s) => {
    ue((e) => {
      typeof s[e] == "string" && (m[e] = s[e]);
    });
  },
  getGoogleAnalyticsName: (s) => s || k(m.googleAnalytics),
  getPrecacheName: (s) => s || k(m.precache),
  getPrefix: () => m.prefix,
  getRuntimeName: (s) => s || k(m.runtime),
  getSuffix: () => m.suffix
};
function W(s, e) {
  const t = new URL(s);
  for (const r of e)
    t.searchParams.delete(r);
  return t.href;
}
async function de(s, e, t, r) {
  const a = W(e.url, t);
  if (e.url === a)
    return s.match(e, r);
  const n = Object.assign(Object.assign({}, r), { ignoreSearch: !0 }), o = await s.keys(e, n);
  for (const c of o) {
    const l = W(c.url, t);
    if (a === l)
      return s.match(c, r);
  }
}
let x;
function pe() {
  if (x === void 0) {
    const s = new Response("");
    if ("body" in s)
      try {
        new Response(s.body), x = !0;
      } catch {
        x = !1;
      }
    x = !1;
  }
  return x;
}
function J(s) {
  s.then(() => {
  });
}
class fe {
  /**
   * Creates a promise and exposes its resolve and reject functions as methods.
   */
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
async function ge() {
  i.log(`About to run ${P.size} callbacks to clean up caches.`);
  for (const s of P)
    await s(), i.log(s, "is complete.");
  i.log("Finished running callbacks.");
}
const d = (s) => new URL(String(s), location.href).href.replace(new RegExp(`^${location.origin}`), "");
function me(s) {
  return new Promise((e) => setTimeout(e, s));
}
function F(s, e) {
  const t = e();
  return s.waitUntil(t), t;
}
async function we(s, e) {
  let t = null;
  if (s.url && (t = new URL(s.url).origin), t !== self.location.origin)
    throw new u("cross-origin-copy-response", { origin: t });
  const r = s.clone(), a = {
    headers: new Headers(r.headers),
    status: r.status,
    statusText: r.statusText
  }, n = e ? e(a) : a, o = pe() ? r.body : await r.blob();
  return new Response(o, n);
}
function ye() {
  self.addEventListener("activate", () => self.clients.claim());
}
try {
  self["workbox:precaching:7.0.0"] && _();
} catch {
}
const be = "__WB_REVISION__";
function Re(s) {
  if (!s)
    throw new u("add-to-cache-list-unexpected-type", { entry: s });
  if (typeof s == "string") {
    const n = new URL(s, location.href);
    return {
      cacheKey: n.href,
      url: n.href
    };
  }
  const { revision: e, url: t } = s;
  if (!t)
    throw new u("add-to-cache-list-unexpected-type", { entry: s });
  if (!e) {
    const n = new URL(t, location.href);
    return {
      cacheKey: n.href,
      url: n.href
    };
  }
  const r = new URL(t, location.href), a = new URL(t, location.href);
  return r.searchParams.set(be, e), {
    cacheKey: r.href,
    url: a.href
  };
}
class xe {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: r }) => {
      if (e.type === "install" && t && t.originalRequest && t.originalRequest instanceof Request) {
        const a = t.originalRequest.url;
        r ? this.notUpdatedURLs.push(a) : this.updatedURLs.push(a);
      }
      return r;
    };
  }
}
class _e {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: t, params: r }) => {
      const a = (r == null ? void 0 : r.cacheKey) || this._precacheController.getCacheKeyForURL(t.url);
      return a ? new Request(a, { headers: t.headers }) : t;
    }, this._precacheController = e;
  }
}
const Ce = (s, e) => {
  i.groupCollapsed(s);
  for (const t of e)
    i.log(t);
  i.groupEnd();
};
function Ne(s) {
  const e = s.length;
  e > 0 && (i.groupCollapsed(`During precaching cleanup, ${e} cached request${e === 1 ? " was" : "s were"} deleted.`), Ce("Deleted Cache Requests", s), i.groupEnd());
}
function B(s, e) {
  if (e.length !== 0) {
    i.groupCollapsed(s);
    for (const t of e)
      i.log(t);
    i.groupEnd();
  }
}
function Ee(s, e) {
  const t = s.length, r = e.length;
  if (t || r) {
    let a = `Precaching ${t} file${t === 1 ? "" : "s"}.`;
    r > 0 && (a += ` ${r} file${r === 1 ? " is" : "s are"} already cached.`), i.groupCollapsed(a), B("View newly precached URLs.", s), B("View previously precached URLs.", e), i.groupEnd();
  }
}
try {
  self["workbox:strategies:7.0.0"] && _();
} catch {
}
function $(s) {
  return typeof s == "string" ? new Request(s) : s;
}
class $e {
  /**
   * Creates a new instance associated with the passed strategy and event
   * that's handling the request.
   *
   * The constructor also initializes the state that will be passed to each of
   * the plugins handling this request.
   *
   * @param {workbox-strategies.Strategy} strategy
   * @param {Object} options
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params] The return value from the
   *     {@link workbox-routing~matchCallback} (if applicable).
   */
  constructor(e, t) {
    this._cacheKeys = {}, h.isInstance(t.event, ExtendableEvent, {
      moduleName: "workbox-strategies",
      className: "StrategyHandler",
      funcName: "constructor",
      paramName: "options.event"
    }), Object.assign(this, t), this.event = t.event, this._strategy = e, this._handlerDeferred = new fe(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const r of this._plugins)
      this._pluginStateMap.set(r, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  /**
   * Fetches a given request (and invokes any applicable plugin callback
   * methods) using the `fetchOptions` (for non-navigation requests) and
   * `plugins` defined on the `Strategy` object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - `requestWillFetch()`
   * - `fetchDidSucceed()`
   * - `fetchDidFail()`
   *
   * @param {Request|string} input The URL or request to fetch.
   * @return {Promise<Response>}
   */
  async fetch(e) {
    const { event: t } = this;
    let r = $(e);
    if (r.mode === "navigate" && t instanceof FetchEvent && t.preloadResponse) {
      const o = await t.preloadResponse;
      if (o)
        return i.log(`Using a preloaded navigation response for '${d(r.url)}'`), o;
    }
    const a = this.hasCallback("fetchDidFail") ? r.clone() : null;
    try {
      for (const o of this.iterateCallbacks("requestWillFetch"))
        r = await o({ request: r.clone(), event: t });
    } catch (o) {
      if (o instanceof Error)
        throw new u("plugin-error-request-will-fetch", {
          thrownErrorMessage: o.message
        });
    }
    const n = r.clone();
    try {
      let o;
      o = await fetch(r, r.mode === "navigate" ? void 0 : this._strategy.fetchOptions), i.debug(`Network request for '${d(r.url)}' returned a response with status '${o.status}'.`);
      for (const c of this.iterateCallbacks("fetchDidSucceed"))
        o = await c({
          event: t,
          request: n,
          response: o
        });
      return o;
    } catch (o) {
      throw i.log(`Network request for '${d(r.url)}' threw an error.`, o), a && await this.runCallbacks("fetchDidFail", {
        error: o,
        event: t,
        originalRequest: a.clone(),
        request: n.clone()
      }), o;
    }
  }
  /**
   * Calls `this.fetch()` and (in the background) runs `this.cachePut()` on
   * the response generated by `this.fetch()`.
   *
   * The call to `this.cachePut()` automatically invokes `this.waitUntil()`,
   * so you do not have to manually call `waitUntil()` on the event.
   *
   * @param {Request|string} input The request or URL to fetch and cache.
   * @return {Promise<Response>}
   */
  async fetchAndCachePut(e) {
    const t = await this.fetch(e), r = t.clone();
    return this.waitUntil(this.cachePut(e, r)), t;
  }
  /**
   * Matches a request from the cache (and invokes any applicable plugin
   * callback methods) using the `cacheName`, `matchOptions`, and `plugins`
   * defined on the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cachedResponseWillByUsed()
   *
   * @param {Request|string} key The Request or URL to use as the cache key.
   * @return {Promise<Response|undefined>} A matching response, if found.
   */
  async cacheMatch(e) {
    const t = $(e);
    let r;
    const { cacheName: a, matchOptions: n } = this._strategy, o = await this.getCacheKey(t, "read"), c = Object.assign(Object.assign({}, n), { cacheName: a });
    r = await caches.match(o, c), r ? i.debug(`Found a cached response in '${a}'.`) : i.debug(`No cached response found in '${a}'.`);
    for (const l of this.iterateCallbacks("cachedResponseWillBeUsed"))
      r = await l({
        cacheName: a,
        matchOptions: n,
        cachedResponse: r,
        request: o,
        event: this.event
      }) || void 0;
    return r;
  }
  /**
   * Puts a request/response pair in the cache (and invokes any applicable
   * plugin callback methods) using the `cacheName` and `plugins` defined on
   * the strategy object.
   *
   * The following plugin lifecycle methods are invoked when using this method:
   * - cacheKeyWillByUsed()
   * - cacheWillUpdate()
   * - cacheDidUpdate()
   *
   * @param {Request|string} key The request or URL to use as the cache key.
   * @param {Response} response The response to cache.
   * @return {Promise<boolean>} `false` if a cacheWillUpdate caused the response
   * not be cached, and `true` otherwise.
   */
  async cachePut(e, t) {
    const r = $(e);
    await me(0);
    const a = await this.getCacheKey(r, "write");
    {
      if (a.method && a.method !== "GET")
        throw new u("attempt-to-cache-non-get-request", {
          url: d(a.url),
          method: a.method
        });
      const f = t.headers.get("Vary");
      f && i.debug(`The response for ${d(a.url)} has a 'Vary: ${f}' header. Consider setting the {ignoreVary: true} option on your strategy to ensure cache matching and deletion works as expected.`);
    }
    if (!t)
      throw i.error(`Cannot cache non-existent response for '${d(a.url)}'.`), new u("cache-put-with-no-response", {
        url: d(a.url)
      });
    const n = await this._ensureResponseSafeToCache(t);
    if (!n)
      return i.debug(`Response '${d(a.url)}' will not be cached.`, n), !1;
    const { cacheName: o, matchOptions: c } = this._strategy, l = await self.caches.open(o), p = this.hasCallback("cacheDidUpdate"), y = p ? await de(
      // TODO(philipwalton): the `__WB_REVISION__` param is a precaching
      // feature. Consider into ways to only add this behavior if using
      // precaching.
      l,
      a.clone(),
      ["__WB_REVISION__"],
      c
    ) : null;
    i.debug(`Updating the '${o}' cache with a new Response for ${d(a.url)}.`);
    try {
      await l.put(a, p ? n.clone() : n);
    } catch (f) {
      if (f instanceof Error)
        throw f.name === "QuotaExceededError" && await ge(), f;
    }
    for (const f of this.iterateCallbacks("cacheDidUpdate"))
      await f({
        cacheName: o,
        oldResponse: y,
        newResponse: n.clone(),
        request: a,
        event: this.event
      });
    return !0;
  }
  /**
   * Checks the list of plugins for the `cacheKeyWillBeUsed` callback, and
   * executes any of those callbacks found in sequence. The final `Request`
   * object returned by the last plugin is treated as the cache key for cache
   * reads and/or writes. If no `cacheKeyWillBeUsed` plugin callbacks have
   * been registered, the passed request is returned unmodified
   *
   * @param {Request} request
   * @param {string} mode
   * @return {Promise<Request>}
   */
  async getCacheKey(e, t) {
    const r = `${e.url} | ${t}`;
    if (!this._cacheKeys[r]) {
      let a = e;
      for (const n of this.iterateCallbacks("cacheKeyWillBeUsed"))
        a = $(await n({
          mode: t,
          request: a,
          event: this.event,
          // params has a type any can't change right now.
          params: this.params
          // eslint-disable-line
        }));
      this._cacheKeys[r] = a;
    }
    return this._cacheKeys[r];
  }
  /**
   * Returns true if the strategy has at least one plugin with the given
   * callback.
   *
   * @param {string} name The name of the callback to check for.
   * @return {boolean}
   */
  hasCallback(e) {
    for (const t of this._strategy.plugins)
      if (e in t)
        return !0;
    return !1;
  }
  /**
   * Runs all plugin callbacks matching the given name, in order, passing the
   * given param object (merged ith the current plugin state) as the only
   * argument.
   *
   * Note: since this method runs all plugins, it's not suitable for cases
   * where the return value of a callback needs to be applied prior to calling
   * the next callback. See
   * {@link workbox-strategies.StrategyHandler#iterateCallbacks}
   * below for how to handle that case.
   *
   * @param {string} name The name of the callback to run within each plugin.
   * @param {Object} param The object to pass as the first (and only) param
   *     when executing each callback. This object will be merged with the
   *     current plugin state prior to callback execution.
   */
  async runCallbacks(e, t) {
    for (const r of this.iterateCallbacks(e))
      await r(t);
  }
  /**
   * Accepts a callback and returns an iterable of matching plugin callbacks,
   * where each callback is wrapped with the current handler state (i.e. when
   * you call each callback, whatever object parameter you pass it will
   * be merged with the plugin's current state).
   *
   * @param {string} name The name fo the callback to run
   * @return {Array<Function>}
   */
  *iterateCallbacks(e) {
    for (const t of this._strategy.plugins)
      if (typeof t[e] == "function") {
        const r = this._pluginStateMap.get(t);
        yield (n) => {
          const o = Object.assign(Object.assign({}, n), { state: r });
          return t[e](o);
        };
      }
  }
  /**
   * Adds a promise to the
   * [extend lifetime promises]{@link https://w3c.github.io/ServiceWorker/#extendableevent-extend-lifetime-promises}
   * of the event event associated with the request being handled (usually a
   * `FetchEvent`).
   *
   * Note: you can await
   * {@link workbox-strategies.StrategyHandler~doneWaiting}
   * to know when all added promises have settled.
   *
   * @param {Promise} promise A promise to add to the extend lifetime promises
   *     of the event that triggered the request.
   */
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  /**
   * Returns a promise that resolves once all promises passed to
   * {@link workbox-strategies.StrategyHandler~waitUntil}
   * have settled.
   *
   * Note: any work done after `doneWaiting()` settles should be manually
   * passed to an event's `waitUntil()` method (not this handler's
   * `waitUntil()` method), otherwise the service worker thread my be killed
   * prior to your work completing.
   */
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  /**
   * Stops running the strategy and immediately resolves any pending
   * `waitUntil()` promises.
   */
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  /**
   * This method will call cacheWillUpdate on the available plugins (or use
   * status === 200) to determine if the Response is safe and valid to cache.
   *
   * @param {Request} options.request
   * @param {Response} options.response
   * @return {Promise<Response|undefined>}
   *
   * @private
   */
  async _ensureResponseSafeToCache(e) {
    let t = e, r = !1;
    for (const a of this.iterateCallbacks("cacheWillUpdate"))
      if (t = await a({
        request: this.request,
        response: t,
        event: this.event
      }) || void 0, r = !0, !t)
        break;
    return r || (t && t.status !== 200 && (t = void 0), t && t.status !== 200 && (t.status === 0 ? i.warn(`The response for '${this.request.url}' is an opaque response. The caching strategy that you're using will not cache opaque responses by default.`) : i.debug(`The response for '${this.request.url}' returned a status code of '${e.status}' and won't be cached as a result.`))), t;
  }
}
class O {
  /**
   * Creates a new instance of the strategy and sets all documented option
   * properties as public instance properties.
   *
   * Note: if a custom strategy class extends the base Strategy class and does
   * not need more than these properties, it does not need to define its own
   * constructor.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * [`CacheQueryOptions`]{@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   */
  constructor(e = {}) {
    this.cacheName = E.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  /**
   * Perform a request strategy and returns a `Promise` that will resolve with
   * a `Response`, invoking all relevant plugin callbacks.
   *
   * When a strategy instance is registered with a Workbox
   * {@link workbox-routing.Route}, this method is automatically
   * called when the route matches.
   *
   * Alternatively, this method can be used in a standalone `FetchEvent`
   * listener by passing it to `event.respondWith()`.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   */
  handle(e) {
    const [t] = this.handleAll(e);
    return t;
  }
  /**
   * Similar to {@link workbox-strategies.Strategy~handle}, but
   * instead of just returning a `Promise` that resolves to a `Response` it
   * it will return an tuple of `[response, done]` promises, where the former
   * (`response`) is equivalent to what `handle()` returns, and the latter is a
   * Promise that will resolve once any promises that were added to
   * `event.waitUntil()` as part of performing the strategy have completed.
   *
   * You can await the `done` promise to ensure any extra work performed by
   * the strategy (usually caching responses) completes successfully.
   *
   * @param {FetchEvent|Object} options A `FetchEvent` or an object with the
   *     properties listed below.
   * @param {Request|string} options.request A request to run this strategy for.
   * @param {ExtendableEvent} options.event The event associated with the
   *     request.
   * @param {URL} [options.url]
   * @param {*} [options.params]
   * @return {Array<Promise>} A tuple of [response, done]
   *     promises that can be used to determine when the response resolves as
   *     well as when the handler has completed all its work.
   */
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const t = e.event, r = typeof e.request == "string" ? new Request(e.request) : e.request, a = "params" in e ? e.params : void 0, n = new $e(this, { event: t, request: r, params: a }), o = this._getResponse(n, r, t), c = this._awaitComplete(o, n, r, t);
    return [o, c];
  }
  async _getResponse(e, t, r) {
    await e.runCallbacks("handlerWillStart", { event: r, request: t });
    let a;
    try {
      if (a = await this._handle(t, e), !a || a.type === "error")
        throw new u("no-response", { url: t.url });
    } catch (n) {
      if (n instanceof Error) {
        for (const o of e.iterateCallbacks("handlerDidError"))
          if (a = await o({ error: n, event: r, request: t }), a)
            break;
      }
      if (a)
        i.log(`While responding to '${d(t.url)}', an ${n instanceof Error ? n.toString() : ""} error occurred. Using a fallback response provided by a handlerDidError plugin.`);
      else
        throw n;
    }
    for (const n of e.iterateCallbacks("handlerWillRespond"))
      a = await n({ event: r, request: t, response: a });
    return a;
  }
  async _awaitComplete(e, t, r, a) {
    let n, o;
    try {
      n = await e;
    } catch {
    }
    try {
      await t.runCallbacks("handlerDidRespond", {
        event: a,
        request: r,
        response: n
      }), await t.doneWaiting();
    } catch (c) {
      c instanceof Error && (o = c);
    }
    if (await t.runCallbacks("handlerDidComplete", {
      event: a,
      request: r,
      response: n,
      error: o
    }), t.destroy(), o)
      throw o;
  }
}
class b extends O {
  /**
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to the cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] {@link https://developers.google.com/web/tools/workbox/guides/using-plugins|Plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters|init}
   * of all fetch() requests made by this strategy.
   * @param {Object} [options.matchOptions] The
   * {@link https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions|CacheQueryOptions}
   * for any `cache.match()` or `cache.put()` calls made by this strategy.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor(e = {}) {
    e.cacheName = E.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(b.copyRedirectedCacheableResponsesPlugin);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const r = await t.cacheMatch(e);
    return r || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
  }
  async _handleFetch(e, t) {
    let r;
    const a = t.params || {};
    if (this._fallbackToNetwork) {
      i.warn(`The precached response for ${d(e.url)} in ${this.cacheName} was not found. Falling back to the network.`);
      const n = a.integrity, o = e.integrity, c = !o || o === n;
      r = await t.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? o || n : void 0
      })), n && c && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, r.clone()) && i.log(`A response for ${d(e.url)} was used to "repair" the precache.`));
    } else
      throw new u("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    {
      const n = a.cacheKey || await t.getCacheKey(e, "read");
      i.groupCollapsed("Precaching is responding to: " + d(e.url)), i.log(`Serving the precached url: ${d(n instanceof Request ? n.url : n)}`), i.groupCollapsed("View request details here."), i.log(e), i.groupEnd(), i.groupCollapsed("View response details here."), i.log(r), i.groupEnd(), i.groupEnd();
    }
    return r;
  }
  async _handleInstall(e, t) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const r = await t.fetch(e);
    if (!await t.cachePut(e, r.clone()))
      throw new u("bad-precaching-response", {
        url: e.url,
        status: r.status
      });
    return r;
  }
  /**
   * This method is complex, as there a number of things to account for:
   *
   * The `plugins` array can be set at construction, and/or it might be added to
   * to at any time before the strategy is used.
   *
   * At the time the strategy is used (i.e. during an `install` event), there
   * needs to be at least one plugin that implements `cacheWillUpdate` in the
   * array, other than `copyRedirectedCacheableResponsesPlugin`.
   *
   * - If this method is called and there are no suitable `cacheWillUpdate`
   * plugins, we need to add `defaultPrecacheCacheabilityPlugin`.
   *
   * - If this method is called and there is exactly one `cacheWillUpdate`, then
   * we don't have to do anything (this might be a previously added
   * `defaultPrecacheCacheabilityPlugin`, or it might be a custom plugin).
   *
   * - If this method is called and there is more than one `cacheWillUpdate`,
   * then we need to check if one is `defaultPrecacheCacheabilityPlugin`. If so,
   * we need to remove it. (This situation is unlikely, but it could happen if
   * the strategy is used multiple times, the first without a `cacheWillUpdate`,
   * and then later on after manually adding a custom `cacheWillUpdate`.)
   *
   * See https://github.com/GoogleChrome/workbox/issues/2737 for more context.
   *
   * @private
   */
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, t = 0;
    for (const [r, a] of this.plugins.entries())
      a !== b.copyRedirectedCacheableResponsesPlugin && (a === b.defaultPrecacheCacheabilityPlugin && (e = r), a.cacheWillUpdate && t++);
    t === 0 ? this.plugins.push(b.defaultPrecacheCacheabilityPlugin) : t > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
b.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: s }) {
    return !s || s.status >= 400 ? null : s;
  }
};
b.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: s }) {
    return s.redirected ? await we(s) : s;
  }
};
class Te {
  /**
   * Create a new PrecacheController.
   *
   * @param {Object} [options]
   * @param {string} [options.cacheName] The cache to use for precaching.
   * @param {string} [options.plugins] Plugins to use when precaching as well
   * as responding to fetch events for precached assets.
   * @param {boolean} [options.fallbackToNetwork=true] Whether to attempt to
   * get the response from the network if there's a precache miss.
   */
  constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: r = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new b({
      cacheName: E.getPrecacheName(e),
      plugins: [
        ...t,
        new _e({ precacheController: this })
      ],
      fallbackToNetwork: r
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  /**
   * @type {workbox-precaching.PrecacheStrategy} The strategy created by this controller and
   * used to cache assets and respond to fetch events.
   */
  get strategy() {
    return this._strategy;
  }
  /**
   * Adds items to the precache list, removing any duplicates and
   * stores the files in the
   * {@link workbox-core.cacheNames|"precache cache"} when the service
   * worker installs.
   *
   * This method can be called multiple times.
   *
   * @param {Array<Object|string>} [entries=[]] Array of entries to precache.
   */
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  /**
   * This method will add items to the precache list, removing duplicates
   * and ensuring the information is valid.
   *
   * @param {Array<workbox-precaching.PrecacheController.PrecacheEntry|string>} entries
   *     Array of entries to precache.
   */
  addToCacheList(e) {
    h.isArray(e, {
      moduleName: "workbox-precaching",
      className: "PrecacheController",
      funcName: "addToCacheList",
      paramName: "entries"
    });
    const t = [];
    for (const r of e) {
      typeof r == "string" ? t.push(r) : r && r.revision === void 0 && t.push(r.url);
      const { cacheKey: a, url: n } = Re(r), o = typeof r != "string" && r.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(n) && this._urlsToCacheKeys.get(n) !== a)
        throw new u("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(n),
          secondEntry: a
        });
      if (typeof r != "string" && r.integrity) {
        if (this._cacheKeysToIntegrities.has(a) && this._cacheKeysToIntegrities.get(a) !== r.integrity)
          throw new u("add-to-cache-list-conflicting-integrities", {
            url: n
          });
        this._cacheKeysToIntegrities.set(a, r.integrity);
      }
      if (this._urlsToCacheKeys.set(n, a), this._urlsToCacheModes.set(n, o), t.length > 0) {
        const c = `Workbox is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        i.warn(c);
      }
    }
  }
  /**
   * Precaches new and updated assets. Call this method from the service worker
   * install event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.InstallResult>}
   */
  install(e) {
    return F(e, async () => {
      const t = new xe();
      this.strategy.plugins.push(t);
      for (const [n, o] of this._urlsToCacheKeys) {
        const c = this._cacheKeysToIntegrities.get(o), l = this._urlsToCacheModes.get(n), p = new Request(n, {
          integrity: c,
          cache: l,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: o },
          request: p,
          event: e
        }));
      }
      const { updatedURLs: r, notUpdatedURLs: a } = t;
      return Ee(r, a), { updatedURLs: r, notUpdatedURLs: a };
    });
  }
  /**
   * Deletes assets that are no longer present in the current precache manifest.
   * Call this method from the service worker activate event.
   *
   * Note: this method calls `event.waitUntil()` for you, so you do not need
   * to call it yourself in your event handlers.
   *
   * @param {ExtendableEvent} event
   * @return {Promise<workbox-precaching.CleanupResult>}
   */
  activate(e) {
    return F(e, async () => {
      const t = await self.caches.open(this.strategy.cacheName), r = await t.keys(), a = new Set(this._urlsToCacheKeys.values()), n = [];
      for (const o of r)
        a.has(o.url) || (await t.delete(o), n.push(o.url));
      return Ne(n), { deletedURLs: n };
    });
  }
  /**
   * Returns a mapping of a precached URL to the corresponding cache key, taking
   * into account the revision information for the URL.
   *
   * @return {Map<string, string>} A URL to cache key mapping.
   */
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  /**
   * Returns a list of all the URLs that have been precached by the current
   * service worker.
   *
   * @return {Array<string>} The precached URLs.
   */
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  /**
   * Returns the cache key used for storing a given URL. If that URL is
   * unversioned, like `/index.html', then the cache key will be the original
   * URL with a search parameter appended to it.
   *
   * @param {string} url A URL whose cache key you want to look up.
   * @return {string} The versioned URL that corresponds to a cache key
   * for the original URL, or undefined if that URL isn't precached.
   */
  getCacheKeyForURL(e) {
    const t = new URL(e, location.href);
    return this._urlsToCacheKeys.get(t.href);
  }
  /**
   * @param {string} url A cache key whose SRI you want to look up.
   * @return {string} The subresource integrity associated with the cache key,
   * or undefined if it's not set.
   */
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  /**
   * This acts as a drop-in replacement for
   * [`cache.match()`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/match)
   * with the following differences:
   *
   * - It knows what the name of the precache is, and only checks in that cache.
   * - It allows you to pass in an "original" URL without versioning parameters,
   * and it will automatically look up the correct cache key for the currently
   * active revision of that URL.
   *
   * E.g., `matchPrecache('index.html')` will find the correct precached
   * response for the currently active service worker, even if the actual cache
   * key is `'/index.html?__WB_REVISION__=1234abcd'`.
   *
   * @param {string|Request} request The key (without revisioning parameters)
   * to look up in the precache.
   * @return {Promise<Response|undefined>}
   */
  async matchPrecache(e) {
    const t = e instanceof Request ? e.url : e, r = this.getCacheKeyForURL(t);
    if (r)
      return (await self.caches.open(this.strategy.cacheName)).match(r);
  }
  /**
   * Returns a function that looks up `url` in the precache (taking into
   * account revision information), and returns the corresponding `Response`.
   *
   * @param {string} url The precached URL which will be used to lookup the
   * `Response`.
   * @return {workbox-routing~handlerCallback}
   */
  createHandlerBoundToURL(e) {
    const t = this.getCacheKeyForURL(e);
    if (!t)
      throw new u("non-precached-url", { url: e });
    return (r) => (r.request = new Request(e), r.params = Object.assign({ cacheKey: t }, r.params), this.strategy.handle(r));
  }
}
let U;
const Q = () => (U || (U = new Te()), U);
try {
  self["workbox:routing:7.0.0"] && _();
} catch {
}
const Y = "GET", ve = [
  "DELETE",
  "GET",
  "HEAD",
  "PATCH",
  "POST",
  "PUT"
], T = (s) => s && typeof s == "object" ? (h.hasMethod(s, "handle", {
  moduleName: "workbox-routing",
  className: "Route",
  funcName: "constructor",
  paramName: "handler"
}), s) : (h.isType(s, "function", {
  moduleName: "workbox-routing",
  className: "Route",
  funcName: "constructor",
  paramName: "handler"
}), { handle: s });
class R {
  /**
   * Constructor for Route class.
   *
   * @param {workbox-routing~matchCallback} match
   * A callback function that determines whether the route matches a given
   * `fetch` event by returning a non-falsy value.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, r = Y) {
    h.isType(e, "function", {
      moduleName: "workbox-routing",
      className: "Route",
      funcName: "constructor",
      paramName: "match"
    }), r && h.isOneOf(r, ve, { paramName: "method" }), this.handler = T(t), this.match = e, this.method = r;
  }
  /**
   *
   * @param {workbox-routing-handlerCallback} handler A callback
   * function that returns a Promise resolving to a Response
   */
  setCatchHandler(e) {
    this.catchHandler = T(e);
  }
}
class ke extends R {
  /**
   * If the regular expression contains
   * [capture groups]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#grouping-back-references},
   * the captured values will be passed to the
   * {@link workbox-routing~handlerCallback} `params`
   * argument.
   *
   * @param {RegExp} regExp The regular expression to match against URLs.
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to match the Route
   * against.
   */
  constructor(e, t, r) {
    h.isInstance(e, RegExp, {
      moduleName: "workbox-routing",
      className: "RegExpRoute",
      funcName: "constructor",
      paramName: "pattern"
    });
    const a = ({ url: n }) => {
      const o = e.exec(n.href);
      if (o) {
        if (n.origin !== location.origin && o.index !== 0) {
          i.debug(`The regular expression '${e.toString()}' only partially matched against the cross-origin URL '${n.toString()}'. RegExpRoute's will only handle cross-origin requests if they match the entire URL.`);
          return;
        }
        return o.slice(1);
      }
    };
    super(a, t, r);
  }
}
class Ue {
  /**
   * Initializes a new Router.
   */
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  /**
   * @return {Map<string, Array<workbox-routing.Route>>} routes A `Map` of HTTP
   * method name ('GET', etc.) to an array of all the corresponding `Route`
   * instances that are registered.
   */
  get routes() {
    return this._routes;
  }
  /**
   * Adds a fetch event listener to respond to events when a route matches
   * the event's request.
   */
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: t } = e, r = this.handleRequest({ request: t, event: e });
      r && e.respondWith(r);
    });
  }
  /**
   * Adds a message event listener for URLs to cache from the window.
   * This is useful to cache resources loaded on the page prior to when the
   * service worker started controlling it.
   *
   * The format of the message data sent from the window should be as follows.
   * Where the `urlsToCache` array may consist of URL strings or an array of
   * URL string + `requestInit` object (the same as you'd pass to `fetch()`).
   *
   * ```
   * {
   *   type: 'CACHE_URLS',
   *   payload: {
   *     urlsToCache: [
   *       './script1.js',
   *       './script2.js',
   *       ['./script3.js', {mode: 'no-cors'}],
   *     ],
   *   },
   * }
   * ```
   */
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: t } = e.data;
        i.debug("Caching URLs from the window", t.urlsToCache);
        const r = Promise.all(t.urlsToCache.map((a) => {
          typeof a == "string" && (a = [a]);
          const n = new Request(...a);
          return this.handleRequest({ request: n, event: e });
        }));
        e.waitUntil(r), e.ports && e.ports[0] && r.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  /**
   * Apply the routing rules to a FetchEvent object to get a Response from an
   * appropriate Route's handler.
   *
   * @param {Object} options
   * @param {Request} options.request The request to handle.
   * @param {ExtendableEvent} options.event The event that triggered the
   *     request.
   * @return {Promise<Response>|undefined} A promise is returned if a
   *     registered route can handle the request. If there is no matching
   *     route and there's no `defaultHandler`, `undefined` is returned.
   */
  handleRequest({ request: e, event: t }) {
    h.isInstance(e, Request, {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "handleRequest",
      paramName: "options.request"
    });
    const r = new URL(e.url, location.href);
    if (!r.protocol.startsWith("http")) {
      i.debug("Workbox Router only supports URLs that start with 'http'.");
      return;
    }
    const a = r.origin === location.origin, { params: n, route: o } = this.findMatchingRoute({
      event: t,
      request: e,
      sameOrigin: a,
      url: r
    });
    let c = o && o.handler;
    const l = [];
    c && (l.push(["Found a route to handle this request:", o]), n && l.push([
      "Passing the following params to the route's handler:",
      n
    ]));
    const p = e.method;
    if (!c && this._defaultHandlerMap.has(p) && (l.push(`Failed to find a matching route. Falling back to the default handler for ${p}.`), c = this._defaultHandlerMap.get(p)), !c) {
      i.debug(`No route found for: ${d(r)}`);
      return;
    }
    i.groupCollapsed(`Router is responding to: ${d(r)}`), l.forEach((g) => {
      Array.isArray(g) ? i.log(...g) : i.log(g);
    }), i.groupEnd();
    let y;
    try {
      y = c.handle({ url: r, request: e, event: t, params: n });
    } catch (g) {
      y = Promise.reject(g);
    }
    const f = o && o.catchHandler;
    return y instanceof Promise && (this._catchHandler || f) && (y = y.catch(async (g) => {
      if (f) {
        i.groupCollapsed(`Error thrown when responding to:  ${d(r)}. Falling back to route's Catch Handler.`), i.error("Error thrown by:", o), i.error(g), i.groupEnd();
        try {
          return await f.handle({ url: r, request: e, event: t, params: n });
        } catch (K) {
          K instanceof Error && (g = K);
        }
      }
      if (this._catchHandler)
        return i.groupCollapsed(`Error thrown when responding to:  ${d(r)}. Falling back to global Catch Handler.`), i.error("Error thrown by:", o), i.error(g), i.groupEnd(), this._catchHandler.handle({ url: r, request: e, event: t });
      throw g;
    })), y;
  }
  /**
   * Checks a request and URL (and optionally an event) against the list of
   * registered routes, and if there's a match, returns the corresponding
   * route along with any params generated by the match.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {boolean} options.sameOrigin The result of comparing `url.origin`
   *     against the current origin.
   * @param {Request} options.request The request to match.
   * @param {Event} options.event The corresponding event.
   * @return {Object} An object with `route` and `params` properties.
   *     They are populated if a matching route was found or `undefined`
   *     otherwise.
   */
  findMatchingRoute({ url: e, sameOrigin: t, request: r, event: a }) {
    const n = this._routes.get(r.method) || [];
    for (const o of n) {
      let c;
      const l = o.match({ url: e, sameOrigin: t, request: r, event: a });
      if (l)
        return l instanceof Promise && i.warn(`While routing ${d(e)}, an async matchCallback function was used. Please convert the following route to use a synchronous matchCallback function:`, o), c = l, (Array.isArray(c) && c.length === 0 || l.constructor === Object && // eslint-disable-line
        Object.keys(l).length === 0 || typeof l == "boolean") && (c = void 0), { route: o, params: c };
    }
    return {};
  }
  /**
   * Define a default `handler` that's called when no routes explicitly
   * match the incoming request.
   *
   * Each HTTP method ('GET', 'POST', etc.) gets its own default handler.
   *
   * Without a default handler, unmatched requests will go against the
   * network as if there were no service worker present.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {string} [method='GET'] The HTTP method to associate with this
   * default handler. Each method has its own default.
   */
  setDefaultHandler(e, t = Y) {
    this._defaultHandlerMap.set(t, T(e));
  }
  /**
   * If a Route throws an error while handling a request, this `handler`
   * will be called and given a chance to provide a response.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   */
  setCatchHandler(e) {
    this._catchHandler = T(e);
  }
  /**
   * Registers a route with the router.
   *
   * @param {workbox-routing.Route} route The route to register.
   */
  registerRoute(e) {
    h.isType(e, "object", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route"
    }), h.hasMethod(e, "match", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route"
    }), h.isType(e.handler, "object", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route"
    }), h.hasMethod(e.handler, "handle", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route.handler"
    }), h.isType(e.method, "string", {
      moduleName: "workbox-routing",
      className: "Router",
      funcName: "registerRoute",
      paramName: "route.method"
    }), this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  /**
   * Unregisters a route with the router.
   *
   * @param {workbox-routing.Route} route The route to unregister.
   */
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new u("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const t = this._routes.get(e.method).indexOf(e);
    if (t > -1)
      this._routes.get(e.method).splice(t, 1);
    else
      throw new u("unregister-route-route-not-registered");
  }
}
let C;
const De = () => (C || (C = new Ue(), C.addFetchListener(), C.addCacheListener()), C);
function M(s, e, t) {
  let r;
  if (typeof s == "string") {
    const n = new URL(s, location.href);
    {
      if (!(s.startsWith("/") || s.startsWith("http")))
        throw new u("invalid-string", {
          moduleName: "workbox-routing",
          funcName: "registerRoute",
          paramName: "capture"
        });
      const c = s.startsWith("http") ? n.pathname : s, l = "[*:?+]";
      new RegExp(`${l}`).exec(c) && i.debug(`The '$capture' parameter contains an Express-style wildcard character (${l}). Strings are now always interpreted as exact matches; use a RegExp for partial or wildcard matches.`);
    }
    const o = ({ url: c }) => (c.pathname === n.pathname && c.origin !== n.origin && i.debug(`${s} only partially matches the cross-origin URL ${c.toString()}. This route will only handle cross-origin requests if they match the entire URL.`), c.href === n.href);
    r = new R(o, e, t);
  } else if (s instanceof RegExp)
    r = new ke(s, e, t);
  else if (typeof s == "function")
    r = new R(s, e, t);
  else if (s instanceof R)
    r = s;
  else
    throw new u("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return De().registerRoute(r), r;
}
function Le(s, e = []) {
  for (const t of [...s.searchParams.keys()])
    e.some((r) => r.test(t)) && s.searchParams.delete(t);
  return s;
}
function* Se(s, { ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/], directoryIndex: t = "index.html", cleanURLs: r = !0, urlManipulation: a } = {}) {
  const n = new URL(s, location.href);
  n.hash = "", yield n.href;
  const o = Le(n, e);
  if (yield o.href, t && o.pathname.endsWith("/")) {
    const c = new URL(o.href);
    c.pathname += t, yield c.href;
  }
  if (r) {
    const c = new URL(o.href);
    c.pathname += ".html", yield c.href;
  }
  if (a) {
    const c = a({ url: n });
    for (const l of c)
      yield l.href;
  }
}
class Pe extends R {
  /**
   * @param {PrecacheController} precacheController A `PrecacheController`
   * instance used to both match requests and respond to fetch events.
   * @param {Object} [options] Options to control how requests are matched
   * against the list of precached URLs.
   * @param {string} [options.directoryIndex=index.html] The `directoryIndex` will
   * check cache entries for a URLs ending with '/' to see if there is a hit when
   * appending the `directoryIndex` value.
   * @param {Array<RegExp>} [options.ignoreURLParametersMatching=[/^utm_/, /^fbclid$/]] An
   * array of regex's to remove search params when looking for a cache match.
   * @param {boolean} [options.cleanURLs=true] The `cleanURLs` option will
   * check the cache for the URL with a `.html` added to the end of the end.
   * @param {workbox-precaching~urlManipulation} [options.urlManipulation]
   * This is a function that should take a URL and return an array of
   * alternative URLs that should be checked for precache matches.
   */
  constructor(e, t) {
    const r = ({ request: a }) => {
      const n = e.getURLsToCacheKeys();
      for (const o of Se(a.url, t)) {
        const c = n.get(o);
        if (c) {
          const l = e.getIntegrityForCacheKey(c);
          return { cacheKey: c, integrity: l };
        }
      }
      i.debug("Precaching did not find a match for " + d(a.url));
    };
    super(r, e.strategy);
  }
}
function Ae(s) {
  const e = Q(), t = new Pe(e, s);
  M(t);
}
const Ie = "-precache-", Oe = async (s, e = Ie) => {
  const r = (await self.caches.keys()).filter((a) => a.includes(e) && a.includes(self.registration.scope) && a !== s);
  return await Promise.all(r.map((a) => self.caches.delete(a))), r;
};
function Me() {
  self.addEventListener("activate", (s) => {
    const e = E.getPrecacheName();
    s.waitUntil(Oe(e).then((t) => {
      t.length > 0 && i.log("The following out-of-date precaches were cleaned up automatically:", t);
    }));
  });
}
function qe(s) {
  Q().precache(s);
}
function Ke(s, e) {
  qe(s), Ae(e);
}
class We extends R {
  /**
   * If both `denylist` and `allowlist` are provided, the `denylist` will
   * take precedence and the request will not match this route.
   *
   * The regular expressions in `allowlist` and `denylist`
   * are matched against the concatenated
   * [`pathname`]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/pathname}
   * and [`search`]{@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLHyperlinkElementUtils/search}
   * portions of the requested URL.
   *
   * *Note*: These RegExps may be evaluated against every destination URL during
   * a navigation. Avoid using
   * [complex RegExps](https://github.com/GoogleChrome/workbox/issues/3077),
   * or else your users may see delays when navigating your site.
   *
   * @param {workbox-routing~handlerCallback} handler A callback
   * function that returns a Promise resulting in a Response.
   * @param {Object} options
   * @param {Array<RegExp>} [options.denylist] If any of these patterns match,
   * the route will not handle the request (even if a allowlist RegExp matches).
   * @param {Array<RegExp>} [options.allowlist=[/./]] If any of these patterns
   * match the URL's pathname and search parameter, the route will handle the
   * request (assuming the denylist doesn't match).
   */
  constructor(e, { allowlist: t = [/./], denylist: r = [] } = {}) {
    h.isArrayOfClass(t, RegExp, {
      moduleName: "workbox-routing",
      className: "NavigationRoute",
      funcName: "constructor",
      paramName: "options.allowlist"
    }), h.isArrayOfClass(r, RegExp, {
      moduleName: "workbox-routing",
      className: "NavigationRoute",
      funcName: "constructor",
      paramName: "options.denylist"
    }), super((a) => this._match(a), e), this._allowlist = t, this._denylist = r;
  }
  /**
   * Routes match handler.
   *
   * @param {Object} options
   * @param {URL} options.url
   * @param {Request} options.request
   * @return {boolean}
   *
   * @private
   */
  _match({ url: e, request: t }) {
    if (t && t.mode !== "navigate")
      return !1;
    const r = e.pathname + e.search;
    for (const a of this._denylist)
      if (a.test(r))
        return i.log(`The navigation route ${r} is not being used, since the URL matches this denylist pattern: ${a.toString()}`), !1;
    return this._allowlist.some((a) => a.test(r)) ? (i.debug(`The navigation route ${r} is being used.`), !0) : (i.log(`The navigation route ${r} is not being used, since the URL being navigated to doesn't match the allowlist.`), !1);
  }
}
try {
  self["workbox:cacheable-response:7.0.0"] && _();
} catch {
}
class Fe {
  /**
   * To construct a new CacheableResponse instance you must provide at least
   * one of the `config` properties.
   *
   * If both `statuses` and `headers` are specified, then both conditions must
   * be met for the `Response` to be considered cacheable.
   *
   * @param {Object} config
   * @param {Array<number>} [config.statuses] One or more status codes that a
   * `Response` can have and be considered cacheable.
   * @param {Object<string,string>} [config.headers] A mapping of header names
   * and expected values that a `Response` can have and be considered cacheable.
   * If multiple headers are provided, only one needs to be present.
   */
  constructor(e = {}) {
    {
      if (!(e.statuses || e.headers))
        throw new u("statuses-or-headers-required", {
          moduleName: "workbox-cacheable-response",
          className: "CacheableResponse",
          funcName: "constructor"
        });
      e.statuses && h.isArray(e.statuses, {
        moduleName: "workbox-cacheable-response",
        className: "CacheableResponse",
        funcName: "constructor",
        paramName: "config.statuses"
      }), e.headers && h.isType(e.headers, "object", {
        moduleName: "workbox-cacheable-response",
        className: "CacheableResponse",
        funcName: "constructor",
        paramName: "config.headers"
      });
    }
    this._statuses = e.statuses, this._headers = e.headers;
  }
  /**
   * Checks a response to see whether it's cacheable or not, based on this
   * object's configuration.
   *
   * @param {Response} response The response whose cacheability is being
   * checked.
   * @return {boolean} `true` if the `Response` is cacheable, and `false`
   * otherwise.
   */
  isResponseCacheable(e) {
    h.isInstance(e, Response, {
      moduleName: "workbox-cacheable-response",
      className: "CacheableResponse",
      funcName: "isResponseCacheable",
      paramName: "response"
    });
    let t = !0;
    if (this._statuses && (t = this._statuses.includes(e.status)), this._headers && t && (t = Object.keys(this._headers).some((r) => e.headers.get(r) === this._headers[r])), !t) {
      i.groupCollapsed(`The request for '${d(e.url)}' returned a response that does not meet the criteria for being cached.`), i.groupCollapsed("View cacheability criteria here."), i.log("Cacheable statuses: " + JSON.stringify(this._statuses)), i.log("Cacheable headers: " + JSON.stringify(this._headers, null, 2)), i.groupEnd();
      const r = {};
      e.headers.forEach((a, n) => {
        r[n] = a;
      }), i.groupCollapsed("View response status and headers here."), i.log(`Response status: ${e.status}`), i.log("Response headers: " + JSON.stringify(r, null, 2)), i.groupEnd(), i.groupCollapsed("View full response details here."), i.log(e.headers), i.log(e), i.groupEnd(), i.groupEnd();
    }
    return t;
  }
}
class z {
  /**
   * To construct a new CacheableResponsePlugin instance you must provide at
   * least one of the `config` properties.
   *
   * If both `statuses` and `headers` are specified, then both conditions must
   * be met for the `Response` to be considered cacheable.
   *
   * @param {Object} config
   * @param {Array<number>} [config.statuses] One or more status codes that a
   * `Response` can have and be considered cacheable.
   * @param {Object<string,string>} [config.headers] A mapping of header names
   * and expected values that a `Response` can have and be considered cacheable.
   * If multiple headers are provided, only one needs to be present.
   */
  constructor(e) {
    this.cacheWillUpdate = async ({ response: t }) => this._cacheableResponse.isResponseCacheable(t) ? t : null, this._cacheableResponse = new Fe(e);
  }
}
const Be = (s, e) => e.some((t) => s instanceof t);
let j, H;
function je() {
  return j || (j = [
    IDBDatabase,
    IDBObjectStore,
    IDBIndex,
    IDBCursor,
    IDBTransaction
  ]);
}
function He() {
  return H || (H = [
    IDBCursor.prototype.advance,
    IDBCursor.prototype.continue,
    IDBCursor.prototype.continuePrimaryKey
  ]);
}
const X = /* @__PURE__ */ new WeakMap(), A = /* @__PURE__ */ new WeakMap(), Z = /* @__PURE__ */ new WeakMap(), D = /* @__PURE__ */ new WeakMap(), q = /* @__PURE__ */ new WeakMap();
function Ve(s) {
  const e = new Promise((t, r) => {
    const a = () => {
      s.removeEventListener("success", n), s.removeEventListener("error", o);
    }, n = () => {
      t(w(s.result)), a();
    }, o = () => {
      r(s.error), a();
    };
    s.addEventListener("success", n), s.addEventListener("error", o);
  });
  return e.then((t) => {
    t instanceof IDBCursor && X.set(t, s);
  }).catch(() => {
  }), q.set(e, s), e;
}
function Ge(s) {
  if (A.has(s))
    return;
  const e = new Promise((t, r) => {
    const a = () => {
      s.removeEventListener("complete", n), s.removeEventListener("error", o), s.removeEventListener("abort", o);
    }, n = () => {
      t(), a();
    }, o = () => {
      r(s.error || new DOMException("AbortError", "AbortError")), a();
    };
    s.addEventListener("complete", n), s.addEventListener("error", o), s.addEventListener("abort", o);
  });
  A.set(s, e);
}
let I = {
  get(s, e, t) {
    if (s instanceof IDBTransaction) {
      if (e === "done")
        return A.get(s);
      if (e === "objectStoreNames")
        return s.objectStoreNames || Z.get(s);
      if (e === "store")
        return t.objectStoreNames[1] ? void 0 : t.objectStore(t.objectStoreNames[0]);
    }
    return w(s[e]);
  },
  set(s, e, t) {
    return s[e] = t, !0;
  },
  has(s, e) {
    return s instanceof IDBTransaction && (e === "done" || e === "store") ? !0 : e in s;
  }
};
function Je(s) {
  I = s(I);
}
function Qe(s) {
  return s === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(e, ...t) {
    const r = s.call(L(this), e, ...t);
    return Z.set(r, e.sort ? e.sort() : [e]), w(r);
  } : He().includes(s) ? function(...e) {
    return s.apply(L(this), e), w(X.get(this));
  } : function(...e) {
    return w(s.apply(L(this), e));
  };
}
function Ye(s) {
  return typeof s == "function" ? Qe(s) : (s instanceof IDBTransaction && Ge(s), Be(s, je()) ? new Proxy(s, I) : s);
}
function w(s) {
  if (s instanceof IDBRequest)
    return Ve(s);
  if (D.has(s))
    return D.get(s);
  const e = Ye(s);
  return e !== s && (D.set(s, e), q.set(e, s)), e;
}
const L = (s) => q.get(s);
function ze(s, e, { blocked: t, upgrade: r, blocking: a, terminated: n } = {}) {
  const o = indexedDB.open(s, e), c = w(o);
  return r && o.addEventListener("upgradeneeded", (l) => {
    r(w(o.result), l.oldVersion, l.newVersion, w(o.transaction), l);
  }), t && o.addEventListener("blocked", (l) => t(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    l.oldVersion,
    l.newVersion,
    l
  )), c.then((l) => {
    n && l.addEventListener("close", () => n()), a && l.addEventListener("versionchange", (p) => a(p.oldVersion, p.newVersion, p));
  }).catch(() => {
  }), c;
}
function Xe(s, { blocked: e } = {}) {
  const t = indexedDB.deleteDatabase(s);
  return e && t.addEventListener("blocked", (r) => e(
    // Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
    r.oldVersion,
    r
  )), w(t).then(() => {
  });
}
const Ze = ["get", "getKey", "getAll", "getAllKeys", "count"], et = ["put", "add", "delete", "clear"], S = /* @__PURE__ */ new Map();
function V(s, e) {
  if (!(s instanceof IDBDatabase && !(e in s) && typeof e == "string"))
    return;
  if (S.get(e))
    return S.get(e);
  const t = e.replace(/FromIndex$/, ""), r = e !== t, a = et.includes(t);
  if (
    // Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(t in (r ? IDBIndex : IDBObjectStore).prototype) || !(a || Ze.includes(t))
  )
    return;
  const n = async function(o, ...c) {
    const l = this.transaction(o, a ? "readwrite" : "readonly");
    let p = l.store;
    return r && (p = p.index(c.shift())), (await Promise.all([
      p[t](...c),
      a && l.done
    ]))[0];
  };
  return S.set(e, n), n;
}
Je((s) => ({
  ...s,
  get: (e, t, r) => V(e, t) || s.get(e, t, r),
  has: (e, t) => !!V(e, t) || s.has(e, t)
}));
try {
  self["workbox:expiration:7.0.0"] && _();
} catch {
}
const tt = "workbox-expiration", N = "cache-entries", G = (s) => {
  const e = new URL(s, location.href);
  return e.hash = "", e.href;
};
class st {
  /**
   *
   * @param {string} cacheName
   *
   * @private
   */
  constructor(e) {
    this._db = null, this._cacheName = e;
  }
  /**
   * Performs an upgrade of indexedDB.
   *
   * @param {IDBPDatabase<CacheDbSchema>} db
   *
   * @private
   */
  _upgradeDb(e) {
    const t = e.createObjectStore(N, { keyPath: "id" });
    t.createIndex("cacheName", "cacheName", { unique: !1 }), t.createIndex("timestamp", "timestamp", { unique: !1 });
  }
  /**
   * Performs an upgrade of indexedDB and deletes deprecated DBs.
   *
   * @param {IDBPDatabase<CacheDbSchema>} db
   *
   * @private
   */
  _upgradeDbAndDeleteOldDbs(e) {
    this._upgradeDb(e), this._cacheName && Xe(this._cacheName);
  }
  /**
   * @param {string} url
   * @param {number} timestamp
   *
   * @private
   */
  async setTimestamp(e, t) {
    e = G(e);
    const r = {
      url: e,
      timestamp: t,
      cacheName: this._cacheName,
      // Creating an ID from the URL and cache name won't be necessary once
      // Edge switches to Chromium and all browsers we support work with
      // array keyPaths.
      id: this._getId(e)
    }, n = (await this.getDb()).transaction(N, "readwrite", {
      durability: "relaxed"
    });
    await n.store.put(r), await n.done;
  }
  /**
   * Returns the timestamp stored for a given URL.
   *
   * @param {string} url
   * @return {number | undefined}
   *
   * @private
   */
  async getTimestamp(e) {
    const r = await (await this.getDb()).get(N, this._getId(e));
    return r == null ? void 0 : r.timestamp;
  }
  /**
   * Iterates through all the entries in the object store (from newest to
   * oldest) and removes entries once either `maxCount` is reached or the
   * entry's timestamp is less than `minTimestamp`.
   *
   * @param {number} minTimestamp
   * @param {number} maxCount
   * @return {Array<string>}
   *
   * @private
   */
  async expireEntries(e, t) {
    const r = await this.getDb();
    let a = await r.transaction(N).store.index("timestamp").openCursor(null, "prev");
    const n = [];
    let o = 0;
    for (; a; ) {
      const l = a.value;
      l.cacheName === this._cacheName && (e && l.timestamp < e || t && o >= t ? n.push(a.value) : o++), a = await a.continue();
    }
    const c = [];
    for (const l of n)
      await r.delete(N, l.id), c.push(l.url);
    return c;
  }
  /**
   * Takes a URL and returns an ID that will be unique in the object store.
   *
   * @param {string} url
   * @return {string}
   *
   * @private
   */
  _getId(e) {
    return this._cacheName + "|" + G(e);
  }
  /**
   * Returns an open connection to the database.
   *
   * @private
   */
  async getDb() {
    return this._db || (this._db = await ze(tt, 1, {
      upgrade: this._upgradeDbAndDeleteOldDbs.bind(this)
    })), this._db;
  }
}
class rt {
  /**
   * To construct a new CacheExpiration instance you must provide at least
   * one of the `config` properties.
   *
   * @param {string} cacheName Name of the cache to apply restrictions to.
   * @param {Object} config
   * @param {number} [config.maxEntries] The maximum number of entries to cache.
   * Entries used the least will be removed as the maximum is reached.
   * @param {number} [config.maxAgeSeconds] The maximum age of an entry before
   * it's treated as stale and removed.
   * @param {Object} [config.matchOptions] The [`CacheQueryOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete#Parameters)
   * that will be used when calling `delete()` on the cache.
   */
  constructor(e, t = {}) {
    this._isRunning = !1, this._rerunRequested = !1;
    {
      if (h.isType(e, "string", {
        moduleName: "workbox-expiration",
        className: "CacheExpiration",
        funcName: "constructor",
        paramName: "cacheName"
      }), !(t.maxEntries || t.maxAgeSeconds))
        throw new u("max-entries-or-age-required", {
          moduleName: "workbox-expiration",
          className: "CacheExpiration",
          funcName: "constructor"
        });
      t.maxEntries && h.isType(t.maxEntries, "number", {
        moduleName: "workbox-expiration",
        className: "CacheExpiration",
        funcName: "constructor",
        paramName: "config.maxEntries"
      }), t.maxAgeSeconds && h.isType(t.maxAgeSeconds, "number", {
        moduleName: "workbox-expiration",
        className: "CacheExpiration",
        funcName: "constructor",
        paramName: "config.maxAgeSeconds"
      });
    }
    this._maxEntries = t.maxEntries, this._maxAgeSeconds = t.maxAgeSeconds, this._matchOptions = t.matchOptions, this._cacheName = e, this._timestampModel = new st(e);
  }
  /**
   * Expires entries for the given cache and given criteria.
   */
  async expireEntries() {
    if (this._isRunning) {
      this._rerunRequested = !0;
      return;
    }
    this._isRunning = !0;
    const e = this._maxAgeSeconds ? Date.now() - this._maxAgeSeconds * 1e3 : 0, t = await this._timestampModel.expireEntries(e, this._maxEntries), r = await self.caches.open(this._cacheName);
    for (const a of t)
      await r.delete(a, this._matchOptions);
    t.length > 0 ? (i.groupCollapsed(`Expired ${t.length} ${t.length === 1 ? "entry" : "entries"} and removed ${t.length === 1 ? "it" : "them"} from the '${this._cacheName}' cache.`), i.log(`Expired the following ${t.length === 1 ? "URL" : "URLs"}:`), t.forEach((a) => i.log(`    ${a}`)), i.groupEnd()) : i.debug("Cache expiration ran and found no entries to remove."), this._isRunning = !1, this._rerunRequested && (this._rerunRequested = !1, J(this.expireEntries()));
  }
  /**
   * Update the timestamp for the given URL. This ensures the when
   * removing entries based on maximum entries, most recently used
   * is accurate or when expiring, the timestamp is up-to-date.
   *
   * @param {string} url
   */
  async updateTimestamp(e) {
    h.isType(e, "string", {
      moduleName: "workbox-expiration",
      className: "CacheExpiration",
      funcName: "updateTimestamp",
      paramName: "url"
    }), await this._timestampModel.setTimestamp(e, Date.now());
  }
  /**
   * Can be used to check if a URL has expired or not before it's used.
   *
   * This requires a look up from IndexedDB, so can be slow.
   *
   * Note: This method will not remove the cached entry, call
   * `expireEntries()` to remove indexedDB and Cache entries.
   *
   * @param {string} url
   * @return {boolean}
   */
  async isURLExpired(e) {
    if (this._maxAgeSeconds) {
      const t = await this._timestampModel.getTimestamp(e), r = Date.now() - this._maxAgeSeconds * 1e3;
      return t !== void 0 ? t < r : !0;
    } else
      throw new u("expired-test-without-max-age", {
        methodName: "isURLExpired",
        paramName: "maxAgeSeconds"
      });
  }
  /**
   * Removes the IndexedDB object store used to keep track of cache expiration
   * metadata.
   */
  async delete() {
    this._rerunRequested = !1, await this._timestampModel.expireEntries(1 / 0);
  }
}
class ee {
  /**
   * @param {ExpirationPluginOptions} config
   * @param {number} [config.maxEntries] The maximum number of entries to cache.
   * Entries used the least will be removed as the maximum is reached.
   * @param {number} [config.maxAgeSeconds] The maximum age of an entry before
   * it's treated as stale and removed.
   * @param {Object} [config.matchOptions] The [`CacheQueryOptions`](https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete#Parameters)
   * that will be used when calling `delete()` on the cache.
   * @param {boolean} [config.purgeOnQuotaError] Whether to opt this cache in to
   * automatic deletion if the available storage quota has been exceeded.
   */
  constructor(e = {}) {
    this.cachedResponseWillBeUsed = async ({ event: t, request: r, cacheName: a, cachedResponse: n }) => {
      if (!n)
        return null;
      const o = this._isResponseDateFresh(n), c = this._getCacheExpiration(a);
      J(c.expireEntries());
      const l = c.updateTimestamp(r.url);
      if (t)
        try {
          t.waitUntil(l);
        } catch {
          "request" in t && i.warn(`Unable to ensure service worker stays alive when updating cache entry for '${d(t.request.url)}'.`);
        }
      return o ? n : null;
    }, this.cacheDidUpdate = async ({ cacheName: t, request: r }) => {
      h.isType(t, "string", {
        moduleName: "workbox-expiration",
        className: "Plugin",
        funcName: "cacheDidUpdate",
        paramName: "cacheName"
      }), h.isInstance(r, Request, {
        moduleName: "workbox-expiration",
        className: "Plugin",
        funcName: "cacheDidUpdate",
        paramName: "request"
      });
      const a = this._getCacheExpiration(t);
      await a.updateTimestamp(r.url), await a.expireEntries();
    };
    {
      if (!(e.maxEntries || e.maxAgeSeconds))
        throw new u("max-entries-or-age-required", {
          moduleName: "workbox-expiration",
          className: "Plugin",
          funcName: "constructor"
        });
      e.maxEntries && h.isType(e.maxEntries, "number", {
        moduleName: "workbox-expiration",
        className: "Plugin",
        funcName: "constructor",
        paramName: "config.maxEntries"
      }), e.maxAgeSeconds && h.isType(e.maxAgeSeconds, "number", {
        moduleName: "workbox-expiration",
        className: "Plugin",
        funcName: "constructor",
        paramName: "config.maxAgeSeconds"
      });
    }
    this._config = e, this._maxAgeSeconds = e.maxAgeSeconds, this._cacheExpirations = /* @__PURE__ */ new Map(), e.purgeOnQuotaError && he(() => this.deleteCacheAndMetadata());
  }
  /**
   * A simple helper method to return a CacheExpiration instance for a given
   * cache name.
   *
   * @param {string} cacheName
   * @return {CacheExpiration}
   *
   * @private
   */
  _getCacheExpiration(e) {
    if (e === E.getRuntimeName())
      throw new u("expire-custom-caches-only");
    let t = this._cacheExpirations.get(e);
    return t || (t = new rt(e, this._config), this._cacheExpirations.set(e, t)), t;
  }
  /**
   * @param {Response} cachedResponse
   * @return {boolean}
   *
   * @private
   */
  _isResponseDateFresh(e) {
    if (!this._maxAgeSeconds)
      return !0;
    const t = this._getDateHeaderTimestamp(e);
    if (t === null)
      return !0;
    const r = Date.now();
    return t >= r - this._maxAgeSeconds * 1e3;
  }
  /**
   * This method will extract the data header and parse it into a useful
   * value.
   *
   * @param {Response} cachedResponse
   * @return {number|null}
   *
   * @private
   */
  _getDateHeaderTimestamp(e) {
    if (!e.headers.has("date"))
      return null;
    const t = e.headers.get("date"), a = new Date(t).getTime();
    return isNaN(a) ? null : a;
  }
  /**
   * This is a helper method that performs two operations:
   *
   * - Deletes *all* the underlying Cache instances associated with this plugin
   * instance, by calling caches.delete() on your behalf.
   * - Deletes the metadata from IndexedDB used to keep track of expiration
   * details for each Cache instance.
   *
   * When using cache expiration, calling this method is preferable to calling
   * `caches.delete()` directly, since this will ensure that the IndexedDB
   * metadata is also cleanly removed and open IndexedDB instances are deleted.
   *
   * Note that if you're *not* using cache expiration for a given cache, calling
   * `caches.delete()` and passing in the cache's name should be sufficient.
   * There is no Workbox-specific method needed for cleanup in that case.
   */
  async deleteCacheAndMetadata() {
    for (const [e, t] of this._cacheExpirations)
      await self.caches.delete(e), await t.delete();
    this._cacheExpirations = /* @__PURE__ */ new Map();
  }
}
const v = {
  strategyStart: (s, e) => `Using ${s} to respond to '${d(e.url)}'`,
  printFinalResponse: (s) => {
    s && (i.groupCollapsed("View the final response here."), i.log(s || "[No response returned]"), i.groupEnd());
  }
};
class at extends O {
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const r = [];
    h.isInstance(e, Request, {
      moduleName: "workbox-strategies",
      className: this.constructor.name,
      funcName: "makeRequest",
      paramName: "request"
    });
    let a = await t.cacheMatch(e), n;
    if (a)
      r.push(`Found a cached response in the '${this.cacheName}' cache.`);
    else {
      r.push(`No response found in the '${this.cacheName}' cache. Will respond with a network request.`);
      try {
        a = await t.fetchAndCachePut(e);
      } catch (o) {
        o instanceof Error && (n = o);
      }
      a ? r.push("Got response from network.") : r.push("Unable to get a response from the network.");
    }
    {
      i.groupCollapsed(v.strategyStart(this.constructor.name, e));
      for (const o of r)
        i.log(o);
      v.printFinalResponse(a), i.groupEnd();
    }
    if (!a)
      throw new u("no-response", { url: e.url, error: n });
    return a;
  }
}
const nt = {
  /**
   * Returns a valid response (to allow caching) if the status is 200 (OK) or
   * 0 (opaque).
   *
   * @param {Object} options
   * @param {Response} options.response
   * @return {Response|null}
   *
   * @private
   */
  cacheWillUpdate: async ({ response: s }) => s.status === 200 || s.status === 0 ? s : null
};
class ot extends O {
  /**
   * @param {Object} [options]
   * @param {string} [options.cacheName] Cache name to store and retrieve
   * requests. Defaults to cache names provided by
   * {@link workbox-core.cacheNames}.
   * @param {Array<Object>} [options.plugins] [Plugins]{@link https://developers.google.com/web/tools/workbox/guides/using-plugins}
   * to use in conjunction with this caching strategy.
   * @param {Object} [options.fetchOptions] Values passed along to the
   * [`init`](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch#Parameters)
   * of [non-navigation](https://github.com/GoogleChrome/workbox/issues/1796)
   * `fetch()` requests made by this strategy.
   * @param {Object} [options.matchOptions] [`CacheQueryOptions`](https://w3c.github.io/ServiceWorker/#dictdef-cachequeryoptions)
   */
  constructor(e = {}) {
    super(e), this.plugins.some((t) => "cacheWillUpdate" in t) || this.plugins.unshift(nt);
  }
  /**
   * @private
   * @param {Request|string} request A request to run this strategy for.
   * @param {workbox-strategies.StrategyHandler} handler The event that
   *     triggered the request.
   * @return {Promise<Response>}
   */
  async _handle(e, t) {
    const r = [];
    h.isInstance(e, Request, {
      moduleName: "workbox-strategies",
      className: this.constructor.name,
      funcName: "handle",
      paramName: "request"
    });
    const a = t.fetchAndCachePut(e).catch(() => {
    });
    t.waitUntil(a);
    let n = await t.cacheMatch(e), o;
    if (n)
      r.push(`Found a cached response in the '${this.cacheName}' cache. Will update with the network response in the background.`);
    else {
      r.push(`No response found in the '${this.cacheName}' cache. Will wait for the network response.`);
      try {
        n = await a;
      } catch (c) {
        c instanceof Error && (o = c);
      }
    }
    {
      i.groupCollapsed(v.strategyStart(this.constructor.name, e));
      for (const c of r)
        i.log(c);
      v.printFinalResponse(n), i.groupEnd();
    }
    if (!n)
      throw new u("no-response", { url: e.url, error: o });
    return n;
  }
}
self.skipWaiting();
ye();
Me();
Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString(), Date.now().toString();
try {
  Ke([
    ...[{"revision":"9ee1bc5944b5ceeb6ec3179fb620615f","url":"assets/_...404_-63-jRIRH.js"},{"revision":"2ce2bf11058760063e59394aa380fd62","url":"assets/_id_-DgxJ7Y-D.js"},{"revision":"554c3640f3bfb980c738e2d7e16fc4f9","url":"assets/(library)-F-OPW-9N.js"},{"revision":"925d37c1b2c7d2e51d9771cc59453335","url":"assets/(preferences)-J8eLhqCr.js"},{"revision":"da297b3a47da63bac944f8bb13180f8c","url":"assets/accessibility-DjiE92jU.js"},{"revision":"18cab9471f636a0de61f2edb86d4dee5","url":"assets/add-Cmv-SCyN.js"},{"revision":"99dbec9a30c29220444c1bea84540e55","url":"assets/add-note-CB3Hevy1.js"},{"revision":"2b72913529ac3166a6810be3726dafba","url":"assets/add-playlist-D_YmbdXa.js"},{"revision":"c7033bc3d3a9c005f7ab4e89cd82fe38","url":"assets/add-user-uHvyAbP3.js"},{"revision":"79a11cfd99c1bfafbe4672c565d96b7f","url":"assets/airplay-3m6E6Ypa.js"},{"revision":"8737613b4e1fd4e67400eecbd239928d","url":"assets/arrow-collapse-in-BPj9McHW.js"},{"revision":"a2eadccdbdf97946444ff2a5a1b5477a","url":"assets/arrow-collapse-mz864Lnd.js"},{"revision":"4c1ec40412a6362ce362b2f1bf939129","url":"assets/arrow-down-acJKCi-v.js"},{"revision":"d3b3595071ae23a043ebf2a306ab6a3f","url":"assets/arrow-expand-Cd3s76yi.js"},{"revision":"f396b54b764703297830ea3725c3aa8b","url":"assets/arrow-expand-out-ChPptQRL.js"},{"revision":"e534ca51a56f9ab57f0659f152a0e762","url":"assets/arrow-left-CNFdBmQP.js"},{"revision":"7b2399ae262da180c4a71f530f1e2029","url":"assets/arrow-right-BAc6s4aX.js"},{"revision":"4c9b76c68b2b82408e8dfb4a193af28f","url":"assets/arrow-up-CdTSqevr.js"},{"revision":"7a32fd966d52257519adb100f305a289","url":"assets/blocklist-CBVuzthj.js"},{"revision":"ae466ba113601a76401f6c00c12f862e","url":"assets/bookmark-CcE10jmS.js"},{"revision":"4fc69d547c8da66bdc843b73a1d667f8","url":"assets/camera-BmcmKPFq.js"},{"revision":"1b95c3043802aa0e8993fcadfd524685","url":"assets/chapters-BJzKhk5K.js"},{"revision":"cc58977e193461d1c19c11bbe2a3715d","url":"assets/chat-collapse-DcgzQkeA.js"},{"revision":"831fbcf5f3a60209450b900ffff33ac4","url":"assets/chat-rJPjJpHY.js"},{"revision":"142d79172b45847f8cb82bb3951f23a1","url":"assets/check-CI8oJXdf.js"},{"revision":"7c6d7add14929aadb804ff03096c0b51","url":"assets/chevron-down-tcut3DrG.js"},{"revision":"1c5a138a96caec97d057e458ff8ab574","url":"assets/chevron-left-DUiAr27P.js"},{"revision":"30c36cb0c0435dd6e255c3a3db74a501","url":"assets/chevron-right-BDmDOmk-.js"},{"revision":"2534685fbd06dcc1ab9852a512831e2b","url":"assets/chevron-up-ChiUsEE6.js"},{"revision":"865b3155d0f34ac62df360fd674db0bd","url":"assets/chromecast-B1LA_ydy.js"},{"revision":"3679f70aa5e2418178861127cddd2672","url":"assets/client-DWanFlQr.js"},{"revision":"8f7ac97bc40812b6eb7612ea8c7e9870","url":"assets/client-wSYUPpgR.css"},{"revision":"847935ead50dad0043883942efcad132","url":"assets/clip-BKqni9nz.js"},{"revision":"e08c104ca58c7ea04c68e4b5f051a2ef","url":"assets/closed-captions-on-qxaMvU0J.js"},{"revision":"11482d412e1279e93275b445c9c2358b","url":"assets/closed-captions-TqOIQ9ix.js"},{"revision":"a40cb24096788a1f87836ae8460cad4c","url":"assets/comment-DXdlv8uD.js"},{"revision":"97ad9ddd7799bdddc7ab9beb3783416f","url":"assets/components-BMGKah2q.js"},{"revision":"91009cb2b3400b85a45d89903f0a726c","url":"assets/computer-BVwv9sEX.js"},{"revision":"73a275dcb3c2395e533a04ffbc61f19c","url":"assets/debug-0BYsCdN7.js"},{"revision":"0e0af521fffb7c45662791ceb490a85a","url":"assets/Description-BLDREoDG.js"},{"revision":"6e1e1aba78921c144e22fa221d907348","url":"assets/device-B-ZgnNBC.js"},{"revision":"9cf4a71b7f53164030cc81546cd2ceaf","url":"assets/download-wgEj5i5p.js"},{"revision":"5335aa1f84a85752c1da88abaca930d6","url":"assets/downloads-BqYkpS21.js"},{"revision":"98cf6dba1d0100e99a51f581b9287f2a","url":"assets/EmptyState-BuYdpmYU.js"},{"revision":"4341bf88b787b85227adb0b97ef5ba55","url":"assets/episodes-BPmRrQQ5.js"},{"revision":"3eda65a1c704d7c58dcb2487f3cadd8d","url":"assets/Error-BKJrmN_l.js"},{"revision":"2b9316e4c8f8dd96461df76a55eace5a","url":"assets/errors-nIGggbx0.js"},{"revision":"79ee7d1231b9d4667b24d341895b80d1","url":"assets/eye-Bnmhlpa6.js"},{"revision":"1453a21cd5a1e89b8ca9299952f708e0","url":"assets/fast-backward-CBve8Rej.js"},{"revision":"204377805304154f15f30df3d41f666b","url":"assets/fast-forward-CtujfR1i.js"},{"revision":"ec26abe7a8c7e660290d9b92330d9133","url":"assets/feed-C6YxyXiI.js"},{"revision":"88cfe140dd615223e9fb22503911d311","url":"assets/Field-BXIxlrTp.js"},{"revision":"1ec9a4ddc72db8c452316b202917c33e","url":"assets/flag-CcBkd1JD.js"},{"revision":"64aa1beb3d8b3d4696cde565a8fce957","url":"assets/fullscreen-arrow-CCu4TGbU.js"},{"revision":"092e7f42ec6b2790b45eb46bbacf43e2","url":"assets/fullscreen-arrow-exit-BQFX6f6r.js"},{"revision":"f5a7a73c00faf9bbc1c4f06ab78cc53a","url":"assets/fullscreen-Dy0U0iji.js"},{"revision":"2f6a395cb1cd31e627046e9161c0e0f5","url":"assets/fullscreen-exit-DcSh831g.js"},{"revision":"64cad118da9d52f053a1118f041a0e26","url":"assets/heart-DdnFVPb9.js"},{"revision":"06fd1726319f936dea7b94392db035b2","url":"assets/history-1CpmRNxz.js"},{"revision":"6446b3e2d729598df7002fa742d4e59a","url":"assets/hls-C2IVF0P1.js"},{"revision":"f1f1b210e13f71d3fd0399f938444f35","url":"assets/import-BFmf27NF.js"},{"revision":"ca1a7d7fc7d28921162112523fd0145f","url":"assets/index-B3L84c1c.js"},{"revision":"b4091a3ac7d1708c332be084f006f763","url":"assets/index-BnPmuIsI.js"},{"revision":"9c62067b2e9ad4e1f9e02685cde7a8bb","url":"assets/index-Cb4tY8hP.js"},{"revision":"40fe869781c88b0dcfd1330d378c7a61","url":"assets/index-DPECAXpK.js"},{"revision":"50d02f55e71653fd5308b6cc04715e04","url":"assets/index-DyZHI5kj.js"},{"revision":"e6f29b43fa17ad2fb9d3648d5c36692c","url":"assets/index-wBMoMgLz.js"},{"revision":"ff808585aa1aec52dc58de7a222df9f8","url":"assets/info-CyqTF302.js"},{"revision":"d5ab5dc9765bfd7075cecac363a8b863","url":"assets/language-Tqe387h7.js"},{"revision":"47ff014144dffbe19c9789e1204b31f6","url":"assets/Link-Dg-h0Eyu.js"},{"revision":"5c24ddc3428308bd3a87eca198e8639d","url":"assets/link-wFIF7dHJ.js"},{"revision":"6fccd0a72756beaea6debb51058e4ebf","url":"assets/lock-closed-B0lBkjkO.js"},{"revision":"fcf7991c9d0b452aee6fc4313fc7280d","url":"assets/lock-open-DW35Z8lA.js"},{"revision":"0b8e24ba50e61d4d4404aacb6ba2ae94","url":"assets/long-press-event-CiZXM6zQ.js"},{"revision":"9e8095c6eb1fe5a40be7ad921f7e790d","url":"assets/menu-horizontal-BNjVaBVb.js"},{"revision":"7e5e23b508b6b6dc333bd953930904e6","url":"assets/menu-vertical-DbnZs8Qd.js"},{"revision":"625293ba784b447cc4fdcdfb909916d8","url":"assets/microphone-Cl5y9FHz.js"},{"revision":"3b6b09a7060cdf41e7e90ae8b517e2db","url":"assets/mobile-BiVvlyLO.js"},{"revision":"1f601dcfb48dccad8098d4efd616a562","url":"assets/moon-Bkm6LHzz.js"},{"revision":"d24d49c3c75524af58089b6664d45d13","url":"assets/music-CrzOb980.js"},{"revision":"b814e175e449aa5c1c1a2dad56503189","url":"assets/music-off-BC2v8AZw.js"},{"revision":"d048f9bc5fc7adf35956bcc229c1afa5","url":"assets/mute-DdQsNfva.js"},{"revision":"9afa2eb1a1b13cd21a3f67b5a1793a06","url":"assets/next-CHFFTtD3.js"},{"revision":"642e2177f3e99b88b1a3d6cb87059d92","url":"assets/no-eye-PCZgmut2.js"},{"revision":"8f3eb930fcbc3178bf2f5beb57a26409","url":"assets/notification-BmkhcbPG.js"},{"revision":"704ed70899ad85956c4b56e08138ed89","url":"assets/odometer-sfPQitua.js"},{"revision":"0822d815662cef8b47502c6861972f77","url":"assets/pause-PukjMdyY.js"},{"revision":"161a6e46a1a15b6a5cd19fa84e2b7854","url":"assets/picture-in-picture-exit-RFWjj5NA.js"},{"revision":"7809c9db7fe8b28f09ed3728be82bacc","url":"assets/picture-in-picture-M6QVQ4w1.js"},{"revision":"add48b19ac986a94d154985b0947bf9f","url":"assets/play-B8m0QCe9.js"},{"revision":"33ec97b75b7d9bf43f8d1044ea2328f7","url":"assets/playback-speed-circle-CDFS3zgo.js"},{"revision":"d7c8b00d6378459adfb5d41cf7cea763","url":"assets/playlist-_nr-c6-Q.js"},{"revision":"c9c979148ebdb1d7400c235278444ea2","url":"assets/playlist-nYaMn11r.js"},{"revision":"8c5b26ff340409ff3e047afd1bb291e8","url":"assets/PlaylistCard-BxVwlLgx.js"},{"revision":"b9a2d1fce862abc5e11340ebf2b68599","url":"assets/PlaylistItem-DDP9XZge.js"},{"revision":"ff43163fa0cf489d06519f1333698c7e","url":"assets/playlists-DrLWylsG.js"},{"revision":"776d15eeae6baf9a024b8d6c85d07c0b","url":"assets/previous-D2Z3qoqi.js"},{"revision":"b4150920ec5e1b55cf8f969949dc19ad","url":"assets/prod-xF6WKuRG.js"},{"revision":"c2638045b33db0e14e5c61aa5983adf4","url":"assets/purify.es-CmEDmnzm.js"},{"revision":"002cc8784ed90859260b910b017524fd","url":"assets/question-mark-C8NgGo0g.js"},{"revision":"b1b572aa02539627efe8b7400efca13c","url":"assets/queue-list-CdXMTaMT.js"},{"revision":"a981da940fa34efcb36506b7bc0bfa5e","url":"assets/radio-button-BPDO0dMV.js"},{"revision":"582dfdeec4a241f12210e50776462041","url":"assets/radio-button-selected-DI2lon3H.js"},{"revision":"1fcaaab669080ce8d9f3f94c209b356f","url":"assets/ReloadPrompt-BxYeSCT1.css"},{"revision":"54418909e0ded738c82c4dae0c7b2ea0","url":"assets/ReloadPrompt-CpIWBecP.js"},{"revision":"8f28ade5b30a0ea36c409d65ba1917b3","url":"assets/repeat-Ba3lv6oa.js"},{"revision":"affec09366a7cda3e94ed315ef524956","url":"assets/repeat-on-B8KoWzao.js"},{"revision":"4fdb745ce6e2c1ba57626a908c7e3fa0","url":"assets/repeat-square-DmDeZy47.js"},{"revision":"b05d1d086b6e06651ebc48b3c64a24b1","url":"assets/repeat-square-on-DzL9lYz9.js"},{"revision":"cfa15c942e98af58b6e8422654c9affc","url":"assets/replay-BJDDLFpK.js"},{"revision":"5fe224e4c47de35f53c214fdc22efe6b","url":"assets/results-CjgOVixw.js"},{"revision":"720408621306cd9e6a2a66f0bfa3f010","url":"assets/rotate-BLEofAUp.js"},{"revision":"d76e05517556438bf8b0f94eb6f47b6b","url":"assets/routing-BmD2xUmi.js"},{"revision":"c3e9c72ef1ce7456fe14ce600e5bd683","url":"assets/search-BCZ9Mwnd.js"},{"revision":"ec2b5f969ed17a0349d6a8086b09b90b","url":"assets/seek-backward-10-giZQxmZK.js"},{"revision":"51512e376c79ac2a38c12f24866e0efa","url":"assets/seek-backward-15-B2PnZz_B.js"},{"revision":"c6deab486b484be6a137e4aea92dd557","url":"assets/seek-backward-30-CxzCnLhk.js"},{"revision":"eac06d3cb72dec471ff199804f5b045c","url":"assets/seek-backward-CWcW2Vwr.js"},{"revision":"92d8da6790fd01abf70ab49977a3f23d","url":"assets/seek-forward-10-BYBktBbw.js"},{"revision":"189e8329cc0d767c6dc59956247e8b8f","url":"assets/seek-forward-15-BXe7ljrk.js"},{"revision":"13120413af161de2531e18034b5d5bf3","url":"assets/seek-forward-30-DUm4wcPl.js"},{"revision":"ea0260d52b4d2c0d7892a4b3bf73220f","url":"assets/seek-forward-B46dtu-v.js"},{"revision":"12eaf5a812a3a33c4fa5b6bdd7c6fc9f","url":"assets/send-DeVbnYAw.js"},{"revision":"18d4141d78f8d764a7c5274a4a551d28","url":"assets/settings-FBY7Wkg9.js"},{"revision":"69021135772c5bf367b80491ba2e4341","url":"assets/settings-menu-5tQEZXBe.js"},{"revision":"8a1317465a29aad421f27006c3dfe049","url":"assets/settings-switch-CJTPgUI2.js"},{"revision":"740da029bf465e86658ec35db154a702","url":"assets/share-arrow-ByZgO3QG.js"},{"revision":"25313848e3cb5496fc1cd76366348bcf","url":"assets/share-CSm-whZf.js"},{"revision":"26a41a277c580ade30cd19b3759fa74c","url":"assets/shuffle-ClSi1Fql.js"},{"revision":"8659bdb2a51bee1c40474d82c3997922","url":"assets/shuffle-on-DVmEBPft.js"},{"revision":"b258c5785eaad0f9fe8ce53e9625ba1a","url":"assets/srt-parser-CLUj-8Vk.js"},{"revision":"54b16748503e005334d37778dd49da12","url":"assets/ssa-parser-CJUgTnfn.js"},{"revision":"36c0f14a273155ff0e0f79809232d728","url":"assets/stop-D89B0duj.js"},{"revision":"dfa0971e5b0beb7b5a447013ffd29770","url":"assets/subscriptions-BngjXra7.js"},{"revision":"792ac227a6963e4ff9dc020d47e5ad3f","url":"assets/subtitles-CDBIGlDh.js"},{"revision":"7450513384f2f89580251119f0795f89","url":"assets/sun-B8T3nQ4V.js"},{"revision":"92478476440efee03637a9a1fe239526","url":"assets/syncStore-BssUQgBy.js"},{"revision":"344394e0cc055085a15aab8f1641e50d","url":"assets/syncStore-CgD1nZSu.css"},{"revision":"95952fd530c8f3d98487d5e5f1664d99","url":"assets/theatre-mode-BMKyqdUC.js"},{"revision":"f359a4b3cc0163c129a6c87f24901ed6","url":"assets/theatre-mode-exit-BmBLN7-m.js"},{"revision":"3022203c9d73cc1ec72cfcef43ef3937","url":"assets/thumbs-down-D60oRObP.js"},{"revision":"c49db2c0cf776ad9839bc0601b916bb3","url":"assets/thumbs-up-q6yMAapI.js"},{"revision":"15ebcd9618ef4cc0211c025bec4c4719","url":"assets/timer-DqnaNK2p.js"},{"revision":"e2c0298485768acdb2ff5fa6f34d9c74","url":"assets/transcript-Bw1LAr77.js"},{"revision":"41ca6c24a940aaae7359df5b34700c10","url":"assets/trending-DGxLue4p.js"},{"revision":"052b6e569e0c6ce459f5bb83e445d3ad","url":"assets/tv-NwWTAkv5.js"},{"revision":"d3203a92157fb7484ee917e2bed30c44","url":"assets/useIntersectionObserver-DOCe7fLW.js"},{"revision":"4dda9215268262fffaad9f77de70bd68","url":"assets/user-DPeRjQiZ.js"},{"revision":"2692f90a75a65449a310e8a6b8e1ce53","url":"assets/vidstack-audio-C9hhqeWo.js"},{"revision":"c30181e51e28b9fdeac58ebef3baec73","url":"assets/vidstack-BcOhbc0p-UEWb2pYX.js"},{"revision":"3a72c13b330007740409d6f166c6d688","url":"assets/vidstack-BJhWhebu-B429KQl9.js"},{"revision":"85a087617f3127e92380c01e46d27626","url":"assets/vidstack-BncYcP_o-IhVZ46WD.js"},{"revision":"cdb1fa628b5e433ca1323c06bba113ea","url":"assets/vidstack-BTBUzdbF-g1Q0NaiI.js"},{"revision":"1b0eb25bf05f3070230accdfdbc6a220","url":"assets/vidstack-CpkvFYuN-DVxRo5ek.js"},{"revision":"1f026417f0c5ed47af44265f915228d7","url":"assets/vidstack-dash-BpngTHRU.js"},{"revision":"c138d8f716a7dcd30f46577e68a7559a","url":"assets/vidstack-DscYSLiW-DtyQKGjb.js"},{"revision":"9fa7ca77370db52946aeb513ce7253db","url":"assets/vidstack-DZeWSaI_-B-nP6Zb8.js"},{"revision":"252f7121cdc81df9e2b0bef7552c84a7","url":"assets/vidstack-google-cast-BYvedlU3.js"},{"revision":"62cea14d518be7e9a2aac0e3dfa3b649","url":"assets/vidstack-hls-BPxS2LG7.js"},{"revision":"624ad336426b6193e8b3d64359a32bca","url":"assets/vidstack-video-DJmD_cO0.js"},{"revision":"2e8850b0978ad2e86c2ffe377b4f6d6b","url":"assets/vidstack-vimeo-B_PzYdDr.js"},{"revision":"bbd8579dce819d5b99d61fdcb343e0a7","url":"assets/vidstack-youtube-AdLmryUR.js"},{"revision":"f2af0add58d0bb45fd7d8df2ea2bc452","url":"assets/volume-high-C6Zvmyx2.js"},{"revision":"401d5aa425ea2c162495a3bd3aee4129","url":"assets/volume-low-CU89z9az.js"},{"revision":"81bdfd524341406613a2fa2c78f2d896","url":"assets/watch-Cqk2eW-_.js"},{"revision":"637c4f33f8a95322fd1a7f0e4651e830","url":"assets/watch-later-CDDlgohn.js"},{"revision":"c639553b3ff41599501a6a21ecd2a05c","url":"assets/workbox-window.prod.es5-DFjpnwFp.js"},{"revision":"c8f39cb25985e1b816f2433dd3100d15","url":"assets/x-mark-CJqJHIux.js"},{"revision":"79f391c7f4f563b3af06bbe1ba06fb70","url":"manifest.webmanifest"}]
    // ...PRECACHE_ROUTES,
  ]);
} catch (s) {
  console.error("Error in precacheAndRoute:", s);
}
const it = new ot({
  cacheName: "dynamic-cache",
  plugins: [
    new z({
      statuses: [0, 200]
    }),
    new ee({
      maxEntries: 50,
      maxAgeSeconds: 60 * 60 * 24 * 30
      // 30 Days
    })
  ],
  fetchOptions: {
    mode: "cors"
  }
});
M(
  new We(it, {
    denylist: [/^\/_/, new RegExp("/[^/?]+\\.[^/]+$")]
  })
);
M(
  /\.(?:png|jpg|jpeg|svg|gif|com)$/,
  new at({
    cacheName: "image-cache",
    plugins: [
      new z({
        statuses: [0, 200]
      }),
      new ee({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60
        // 30 Days
      }),
      {
        cacheKeyWillBeUsed: async ({ request: s }) => s.url
      }
    ]
  })
);
self.addEventListener("message", async (s) => {
  var e;
  if (console.log("Received message in service worker:", s.data), (e = s.data) != null && e.sharedService) {
    console.log("Entering sharedService condition");
    const t = await self.clients.get(s.data.clientId);
    t ? (console.log("Client found:", t), t.postMessage(s.data, s.ports)) : console.error("Client not found for clientId:", s.data.clientId);
  } else
    console.warn("sharedService property not found in event data");
});
self.addEventListener("fetch", async (s) => {
  if (s.request.url === self.registration.scope + "clientId")
    return s.respondWith(
      new Response(s.clientId, {
        headers: { "Content-Type": "text/plain" }
      })
    );
});
//# sourceMappingURL=claims-sw.js.map
