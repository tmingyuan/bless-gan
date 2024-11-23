var p = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {};
function l(t) {
  return t && t.__esModule && Object.prototype.hasOwnProperty.call(t, "default") ? t.default : t
}
function h(t) {
  if (t.__esModule)
    return t;
  var e = t.default;
  if (typeof e == "function") {
    var n = function o() {
      return this instanceof o ? Reflect.construct(e, arguments, this.constructor) : e.apply(this, arguments)
    };
    n.prototype = e.prototype
  } else
    n = {};
  return Object.defineProperty(n, "__esModule", {
    value: !0
  }),
    Object.keys(t).forEach(function(o) {
      var s = Object.getOwnPropertyDescriptor(t, o);
      Object.defineProperty(n, o, s.get ? s : {
        enumerable: !0,
        get: function() {
          return t[o]
        }
      })
    }),
    n
}
const a = "https://gateway-run.bls.dev/api/v1"
  , f = "https://tight-block-2413.txlabs.workers.dev";
async function r() {
  return (await chrome.storage.local.get("authToken")).authToken
}
async function g(t, e) {
  const n = await r()
    , o = `${a}/nodes/${t}`
    , s = await d();
  return (await fetch(o, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${n}`
    },
    body: JSON.stringify({
      ipAddress: s,
      hardwareId: e
    })
  })).json()
}
async function y(t) {
  const e = await r()
    , n = `${a}/nodes/${t}/start-session`;
  return (await fetch(n, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${e}`
    }
  })).json()
}
async function w(t) {
  const e = await r()
    , n = `${a}/nodes/${t}/stop-session`;
  return (await fetch(n, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${e}`
    }
  })).json()
}
async function m(t) {
  const e = await r()
    , n = `${a}/nodes/${t}/ping`;
  return (await fetch(n, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${e}`
    }
  })).json()
}
async function d() {
  return (await (await fetch(f)).json()).ip
}
function $(t, e=6, n=4) {
  const o = t == null ? void 0 : t.slice(0, e + 2)
    , s = t == null ? void 0 : t.slice(-n);
  return `${o}...${s}`
}
function b(t) {
  return new Date(t).toTimeString().split(" ")[0]
}
function j(t) {
  const e = isNaN(t) || t < 0 ? 0 : Math.floor(t)
    , n = Math.floor(e / 1440)
    , o = Math.floor(e % 1440 / 60)
    , s = e % 60
    , c = u => u.toString().padStart(2, "0");
  let i = "";
  return n > 0 && (i += `${n}d `),
    i += `${o}h ${c(s)}m`,
    i
}
module.exports = {
  G: a,
  a: j,
  b: h,
  c: p,
  d: y,
  e: w,
  f: b,
  g: l,
  p: m,
  r: g,
  s: $,
}
// export {a as G, j as a, h as b, p as c, y as d, w as e, b as f, l as g, m as p, g as r, $ as s};
