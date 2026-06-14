var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:process>
var define_process_default;
var init_define_process = __esm({
  "<define:process>"() {
    define_process_default = { env: {}, browser: true, version: "" };
  }
});

// node_modules/node-events/index.js
var require_node_events = __commonJS({
  "node_modules/node-events/index.js"(exports, module) {
    "use strict";
    init_define_process();
    function addEventListener(listeners, event, listener, type) {
      if (listeners[type] === void 0) {
        listeners[type] = {};
      }
      var typeEvent = listeners[type][event];
      if (typeEvent === void 0) {
        listeners[type][event] = typeEvent = [];
      }
      typeEvent[typeEvent.length] = listener;
    }
    function removeEventListener(listeners, callback, context) {
      if (listeners && listeners.length) {
        var newListeners = [];
        for (var i = 0; i < listeners.length; i++) {
          var listener = listeners[i];
          if (listener[0] !== callback || context && context !== listener[1]) {
            newListeners[newListeners.length] = listener;
          }
        }
        return newListeners;
      }
    }
    function emitEvent(listeners, a1, a2) {
      var listener;
      if (listeners.length === 1) {
        listener = listeners[0];
        if (a2 === void 0) {
          listener[0].call(listener[1], a1);
        } else {
          listener[0].call(listener[1], a1, a2);
        }
        return;
      }
      var length = listeners.length;
      while (--length) {
        listener = listeners[length];
        listener[0].call(listener[1], a1, a2);
      }
    }
    function EventEmitter4() {
      this.onListeners = void 0;
      this.onceListeners = void 0;
    }
    ["on", "once"].forEach(function(type) {
      EventEmitter4.prototype[type] = function(event, callback, context) {
        addEventListener(this, event, [callback, context], type + "Listeners");
        return this;
      };
    });
    EventEmitter4.prototype.emit = function(event, a1, a2) {
      var listeners;
      var fired = false;
      if (this.onListeners !== void 0) {
        listeners = this.onListeners[event];
        if (listeners) {
          emitEvent(listeners, a1, a2);
          fired = true;
        }
      }
      if (this.onceListeners !== void 0) {
        listeners = this.onceListeners[event];
        if (listeners !== void 0) {
          this.onceListeners[event] = void 0;
          emitEvent(listeners, a1, a2);
          fired = true;
        }
      }
      return fired;
    };
    EventEmitter4.prototype.listeners = function(event) {
      var onListeners = this.onListeners[event];
      var onceListeners = this.onceListeners[event];
      if (onListeners !== void 0) {
        if (onceListeners !== void 0) {
          return Array.concat(onListeners, onceListeners);
        }
        return onListeners;
      }
      if (onceListeners !== void 0) {
        return onceListeners;
      }
    };
    EventEmitter4.prototype.removeListener = function(event, callback, context) {
      if (this.onListeners !== void 0) {
        this.onListeners[event] = removeEventListener(
          this.onListeners[event],
          callback,
          context
        );
      }
      if (this.onceListeners !== void 0) {
        this.onceListeners[event] = removeEventListener(
          this.onceListeners[event],
          callback,
          context
        );
      }
      return this;
    };
    EventEmitter4.prototype.removeAllListeners = function(event) {
      if (event) {
        if (this.onListeners !== void 0) {
          this.onListeners[event] = void 0;
        }
        if (this.onceListeners !== void 0) {
          this.onceListeners[event] = void 0;
        }
        return;
      }
      this.onListeners = this.onceListeners = void 0;
      return this;
    };
    EventEmitter4.prototype.addListener = EventEmitter4.prototype.on;
    EventEmitter4.prototype.setMaxListeners = function() {
      return this;
    };
    EventEmitter4.EventEmitter = EventEmitter4;
    module.exports = EventEmitter4;
  }
});

// index.js
init_define_process();

// node_modules/esri-dump/dist/index.js
init_define_process();

// node_modules/esri-dump/dist/lib/geometry.js
init_define_process();
var import_node_events = __toESM(require_node_events(), 1);

// node_modules/@openaddresses/batch-error/dist/index.js
init_define_process();
var PublicError = class extends Error {
  status;
  safe;
  constructor(status, err, safe, print = true) {
    if (err && Object.hasOwn(err, "severity"))
      err = new Error(err.message);
    super(err ? err.message : safe);
    if (print && !(status >= 200 && status <= 299) && !(status >= 401 && status <= 404)) {
      if (status === 400) {
        console.warn(err ? err : "Warning: " + safe);
      } else {
        console.error(err ? err : "Error: " + safe);
      }
    }
    this.status = status;
    this.safe = safe || "Generic Error";
    this.name = "PublicError";
    Error.captureStackTrace(this, this.constructor);
  }
  static respond(err, res, messages = []) {
    if (typeof err === "object") {
      const serr = err;
      const status = Object.hasOwn(serr, "status") ? !isNaN(Number(serr.status)) ? Number(serr.status) : 500 : 500;
      if (status === 500) {
        console.error(err);
      }
      if (!res.headersSent) {
        res.status(status).send({
          status,
          message: Object.hasOwn(serr, "safe") ? serr.safe : "Internal Server Error",
          messages
        });
      } else {
        res.end();
      }
    } else {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).send({
          status: 500,
          message: "Internal Server Error",
          messages
        });
      } else {
        res.end();
      }
    }
  }
};

// node_modules/esri-dump/dist/lib/rings2geojson.js
init_define_process();
function ringIsClockwise(ringToTest) {
  let total = 0, i = 0, pt1 = ringToTest[i], pt2;
  const rLength = ringToTest.length;
  for (i; i < rLength - 1; i++) {
    pt2 = ringToTest[i + 1];
    total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
    pt1 = pt2;
  }
  return total >= 0;
}
function closeRing(coordinates) {
  if (!pointsEqual(coordinates[0], coordinates[coordinates.length - 1])) {
    coordinates.push(coordinates[0]);
  }
  return coordinates;
}
function pointsEqual(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}
function coordinatesContainCoordinates(outer, inner) {
  const intersects = arraysIntersectArrays(outer, inner);
  const contains = coordinatesContainPoint(outer, inner[0]);
  if (!intersects && contains) {
    return true;
  }
  return false;
}
function coordinatesContainPoint(coordinates, point) {
  let contains = false;
  for (let i = -1, l = coordinates.length, j = l - 1; ++i < l; j = i) {
    if ((coordinates[i][1] <= point[1] && point[1] < coordinates[j][1] || coordinates[j][1] <= point[1] && point[1] < coordinates[i][1]) && point[0] < (coordinates[j][0] - coordinates[i][0]) * (point[1] - coordinates[i][1]) / (coordinates[j][1] - coordinates[i][1]) + coordinates[i][0]) {
      contains = !contains;
    }
  }
  return contains;
}
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(parseFloat(n));
}
function edgeIntersectsEdge(a1, a2, b1, b2) {
  const ua_t = (b2[0] - b1[0]) * (a1[1] - b1[1]) - (b2[1] - b1[1]) * (a1[0] - b1[0]);
  const ub_t = (a2[0] - a1[0]) * (a1[1] - b1[1]) - (a2[1] - a1[1]) * (a1[0] - b1[0]);
  const u_b = (b2[1] - b1[1]) * (a2[0] - a1[0]) - (b2[0] - b1[0]) * (a2[1] - a1[1]);
  if (u_b !== 0) {
    const ua = ua_t / u_b;
    const ub = ub_t / u_b;
    if (0 <= ua && ua <= 1 && 0 <= ub && ub <= 1) {
      return true;
    }
  }
  return false;
}
function arraysIntersectArrays(a, b) {
  if (Array.isArray(a[0]) && isNumber(a[0][0])) {
    if (Array.isArray(b[0]) && isNumber(b[0][0])) {
      a = a;
      b = b;
      for (let i = 0; i < a.length - 1; i++) {
        for (let j = 0; j < b.length - 1; j++) {
          if (edgeIntersectsEdge(a[i], a[i + 1], b[j], b[j + 1])) {
            return true;
          }
        }
      }
    } else {
      a = a;
      b = b;
      for (let k = 0; k < b.length; k++) {
        if (arraysIntersectArrays(a, b[k])) {
          return true;
        }
      }
    }
  } else {
    a = a;
    b = b;
    for (let l = 0; l < a.length; l++) {
      if (arraysIntersectArrays(a[l], b)) {
        return true;
      }
    }
  }
  return false;
}
function rings2geojson_default(rings) {
  const outerRings = [];
  const holes = [];
  for (let r = 0; r < rings.length; r++) {
    const ring = closeRing(rings[r].slice(0));
    if (ring.length < 4) {
      continue;
    }
    if (ringIsClockwise(ring)) {
      const polygon = [ring];
      outerRings.push(polygon);
    } else {
      holes.push(ring);
    }
  }
  while (holes.length) {
    const hole = holes.pop();
    let matched = false;
    for (let x = outerRings.length - 1; x >= 0; x--) {
      const outerRing = outerRings[x][0];
      if (coordinatesContainCoordinates(outerRing, hole)) {
        outerRings[x].push(hole);
        matched = true;
        break;
      }
    }
    if (!matched) {
      outerRings.push([hole.reverse()]);
    }
  }
  if (outerRings.length === 1) {
    return {
      type: "Polygon",
      coordinates: outerRings[0]
    };
  } else {
    return {
      type: "MultiPolygon",
      coordinates: outerRings
    };
  }
}

// node_modules/esri-dump/dist/lib/fetch.js
init_define_process();
async function Fetch(config, url, opts = {}) {
  url = new URL(url);
  if (!config.headers)
    config.headers = {};
  if (!config.params)
    config.params = {};
  for (const param in config.params)
    url.searchParams.append(param, config.params[param]);
  url.searchParams.append("f", "json");
  if (!opts.headers)
    opts.headers = {};
  Object.assign(opts.headers, config.headers);
  const headers = new Headers();
  headers.set("Accept-Encoding", "gzip");
  for (const header in opts.headers) {
    headers.set(header, opts.headers[header]);
  }
  return await fetch(url, {
    ...opts,
    headers
  });
}

// node_modules/esri-dump/dist/lib/schema.js
init_define_process();
var Types = /* @__PURE__ */ new Map([
  ["esriFieldTypeDate", { type: "string", format: "date-time" }],
  ["esriFieldTypeString", { type: "string" }],
  ["esriFieldTypeDouble", { type: "number" }],
  ["esriFieldTypeSingle", { type: "number" }],
  ["esriFieldTypeOID", { type: "number" }],
  ["esriFieldTypeInteger", { type: "integer" }],
  ["esriFieldTypeSmallInteger", { type: "integer" }],
  ["esriFieldTypeGeometry", { type: "object" }],
  ["esriFieldTypeBlob", { type: "object" }],
  ["esriFieldTypeGlobalID", { type: "string" }],
  ["esriFieldTypeRaster", { type: "object" }],
  ["esriFieldTypeGUID", { type: "string" }],
  ["esriFieldTypeXML", { type: "string" }]
]);
function FieldToSchema(metadata) {
  const doc = {
    type: "object",
    required: [],
    additionalProperties: false,
    properties: {}
  };
  if (!metadata.fields && !Array.isArray(metadata.fields)) {
    return doc;
  }
  for (const field of metadata.fields) {
    const name = String(field.name);
    const type = Types.has(field.type) ? Types.get(field.type) : { type: "string" };
    const prop = doc.properties[name] = {
      ...JSON.parse(JSON.stringify(type))
    };
    if (!isNaN(field.length) && type.type === "string") {
      prop.maxLength = field.length;
    }
  }
  return doc;
}

// node_modules/esri-dump/dist/lib/geometry.js
var Geometry = class _Geometry extends import_node_events.default {
  baseUrl;
  geomType;
  maxRecords;
  set;
  oidField;
  paths;
  schema;
  constructor(url, metadata) {
    super();
    this.baseUrl = url;
    this.paths = [metadata.extent];
    this.geomType = metadata.geometryType;
    this.maxRecords = metadata.maxRecordCount || null;
    this.set = /* @__PURE__ */ new Set();
    this.oidField = _Geometry.findOidField(metadata.fields);
    this.schema = FieldToSchema(metadata);
  }
  async fetch(config) {
    try {
      if (config.approach === EsriDumpConfigApproach.BBOX || config.approach === EsriDumpConfigApproach.TOP_FEATURES_BBOX) {
        await this.fetch_bbox(config);
      } else if (config.approach === EsriDumpConfigApproach.ITER || config.approach === EsriDumpConfigApproach.TOP_FEATURES_ITER) {
        await this.fetch_iter(config);
      } else {
        throw new PublicError(400, null, "Unknown Approach");
      }
    } catch (err) {
      this.emit("error", err);
    }
  }
  async fetch_iter(config) {
    if (!this.oidField)
      this.emit("error", new PublicError(400, null, "Cannot use iter function as oidField could not be determined"));
    const queryFragment = config.approach === EsriDumpConfigApproach.TOP_FEATURES_ITER ? "/queryTopFeatures" : "/query";
    const url = new URL(String(this.baseUrl) + queryFragment);
    url.searchParams.append("returnCountOnly", "true");
    if (!config.params.where)
      url.searchParams.append("where", "1=1");
    if (define_process_default.env.DEBUG)
      console.error(String(url));
    const res = await Fetch(config, url);
    if (!res.ok)
      return this.emit("error", await res.text());
    const meta = await res.json();
    if (isNaN(meta.count)) {
      return this.emit(`error', 'Unable to determine feature count - ${JSON.stringify(meta)}`);
    }
    const count = meta.count;
    let curr = 0;
    while (curr < count) {
      let attempts = 0;
      const url2 = new URL(String(this.baseUrl) + queryFragment);
      if (!config.params.where)
        url2.searchParams.append("where", "1=1");
      url2.searchParams.append("geometryPrecision", "7");
      url2.searchParams.append("returnGeometry", "true");
      url2.searchParams.append("outSR", "4326");
      url2.searchParams.append("outFields", "*");
      url2.searchParams.append("resultOffset", String(curr));
      let data = null;
      while (attempts <= 5) {
        attempts++;
        if (define_process_default.env.DEBUG)
          console.error(String(url2));
        const res2 = await Fetch(config, url2);
        if (!res2.ok)
          return this.emit("error", await res2.text());
        data = await res2.json();
        if (data && data.error)
          continue;
        if (data && data.features) {
          curr += data.features.length;
          for (const feature of data.features) {
            if (!this.set.has(feature.attributes[this.oidField])) {
              this.set.add(feature.attributes[this.oidField]);
              try {
                const feat = this.toGeoJSON(feature);
                this.emit("feature", feat);
              } catch (err) {
                if (define_process_default.env.DEBUG)
                  console.error("Invalid Feature", feature, err instanceof Error ? err.message : err);
              }
            }
          }
          break;
        } else if (!data) {
          return this.emit("error", new PublicError(400, null, "Data from" + url2 + " undefined"));
        } else {
          return this.emit("error", new PublicError(400, null, "Error with " + url2));
        }
      }
      if (attempts > 5)
        return this.emit("error", "Query of " + url2 + " unsuccessful: " + data.error.details);
    }
    this.emit("done");
  }
  async fetch_bbox(config) {
    const queryFragment = config.approach === EsriDumpConfigApproach.TOP_FEATURES_BBOX ? "/queryTopFeatures" : "/query";
    while (this.paths.length) {
      const bounds = this.paths.pop();
      const url = new URL(String(this.baseUrl) + queryFragment);
      url.searchParams.append("geometry", [bounds.xmin, bounds.ymin, bounds.xmax, bounds.ymax].join(","));
      url.searchParams.append("geometryType", "esriGeometryEnvelope");
      url.searchParams.append("spatialRel", "esriSpatialRelIntersects");
      url.searchParams.append("geometryPrecision", "7");
      url.searchParams.append("returnGeometry", "true");
      url.searchParams.append("outSR", "4326");
      url.searchParams.append("outFields", "*");
      let attempts = 0;
      let data = null;
      while (attempts <= 5) {
        attempts++;
        if (define_process_default.env.DEBUG)
          console.error(String(url));
        const res = await Fetch(config, url);
        if (!res.ok)
          return this.emit("error", await res.text());
        data = await res.json();
        if (data && data.error)
          continue;
        if (data && data.features) {
          if (this.maxRecords === null) {
            this.maxRecords = data.features.length;
          }
          if (data.exceededTransferLimit || data.features.length === this.maxRecords) {
            _Geometry.splitBbox(bounds).forEach((subbox) => {
              this.paths.push(subbox);
            });
          } else {
            for (const feature of data.features) {
              if (!this.set.has(feature.attributes[this.oidField])) {
                this.set.add(feature.attributes[this.oidField]);
                try {
                  const feat = this.toGeoJSON(feature);
                  this.emit("feature", feat);
                } catch (err) {
                  if (define_process_default.env.DEBUG)
                    console.error("Invalid Feature", feature, err instanceof Error ? err.message : err);
                }
              }
            }
          }
          break;
        } else if (!data) {
          return this.emit("error", new PublicError(400, null, "Data from" + url + " undefined"));
        } else {
          return this.emit("error", new PublicError(400, null, "Error with " + url));
        }
      }
      if (attempts > 5)
        return this.emit("error", "Query of " + url + " unsuccessful: " + data.error.details);
    }
    this.emit("done");
  }
  toGeoJSON(esrifeature) {
    const id = esrifeature.attributes[this.oidField];
    const type = "Feature";
    const properties = {};
    for (const prop in esrifeature.attributes) {
      const schema = this.schema.properties[prop];
      if (typeof schema !== "boolean" && schema.format === "date-time" && esrifeature.attributes[prop]) {
        properties[prop] = new Date(esrifeature.attributes[prop]).toISOString();
      } else {
        properties[prop] = esrifeature.attributes[prop];
      }
    }
    if (this.geomType === "esriGeometryPolygon") {
      return {
        id,
        type,
        properties,
        geometry: rings2geojson_default(esrifeature.geometry.rings)
      };
    } else if (this.geomType === "esriGeometryPolyline") {
      return {
        id,
        type,
        properties,
        geometry: {
          type: "MultiLineString",
          coordinates: esrifeature.geometry.paths
        }
      };
    } else if (this.geomType === "esriGeometryPoint") {
      return {
        id,
        type,
        properties,
        geometry: {
          type: "Point",
          coordinates: [esrifeature.geometry.x, esrifeature.geometry.y]
        }
      };
    }
  }
  static splitBbox(bbox) {
    const halfWidth = (bbox.xmax - bbox.xmin) / 2;
    const halfHeight = (bbox.ymax - bbox.ymin) / 2;
    return [
      { xmin: bbox.xmin, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth },
      { xmin: bbox.xmin + halfWidth, ymin: bbox.ymin, ymax: bbox.ymin + halfHeight, xmax: bbox.xmax },
      { xmin: bbox.xmin, ymin: bbox.ymin + halfHeight, xmax: bbox.xmin + halfWidth, ymax: bbox.ymax },
      { xmin: bbox.xmin + halfWidth, ymin: bbox.ymin + halfHeight, xmax: bbox.xmax, ymax: bbox.ymax }
    ];
  }
  static findOidField(fields) {
    const oidField = fields.filter((field) => {
      return field.type === "esriFieldTypeOID";
    })[0];
    if (oidField) {
      return oidField.name;
    } else {
      const possibleIds = ["OBJECTID", "objectid", "FID", "ID", "fid", "id"];
      const nextBestOidField = fields.filter((field) => {
        return possibleIds.indexOf(field.name) > -1;
      }).sort((a, b) => {
        return possibleIds.indexOf(a.name) - possibleIds.indexOf(b.name);
      })[0];
      if (nextBestOidField) {
        return nextBestOidField.name;
      } else {
        throw new PublicError(400, null, "Could not determine OBJECTID field.");
      }
    }
  }
};

// node_modules/esri-dump/dist/lib/discovery.js
init_define_process();
var import_node_events2 = __toESM(require_node_events(), 1);
var Discovery = class extends import_node_events2.default {
  baseUrl;
  document;
  constructor(url) {
    super();
    url.pathname = url.pathname.replace(/\/rest\/services.*/, "/rest/services");
    this.baseUrl = url;
    this.document = {
      version: void 0,
      collections: []
    };
  }
  async fetch(config) {
    if (define_process_default.env.DEBUG)
      console.error(String(this.baseUrl));
    let base = await Fetch(config, this.baseUrl);
    if (!base.ok)
      return this.emit("error", await base.text());
    base = await base.json();
    this.document.version = String(base.version);
    await this.#request(config, base);
    this.emit("done");
    return this.document;
  }
  async #request(config, base) {
    const services = base.services.map((service) => {
      const url = new URL(this.baseUrl);
      url.pathname = url.pathname + "/" + service.name + "/" + service.type;
      return {
        url,
        name: String(service.name),
        type: String(service.type)
      };
    });
    services.push(...await this.#folders(config, base.folders));
    for (const service_meta of services) {
      const service = await this.#service(config, service_meta);
      this.emit("service", service);
      if (!service.layers)
        service.layers = [];
      for (const layer_meta of service.layers) {
        const url = new URL(service_meta.url);
        url.pathname = url.pathname + "/" + layer_meta.id;
        const layer = await this.#layer(config, url);
        layer.schema = FieldToSchema(layer);
        this.emit("layer", layer);
      }
    }
  }
  async #layer(config, layer_url) {
    if (define_process_default.env.DEBUG)
      console.error(String(layer_url));
    const req = await Fetch(config, layer_url);
    if (!req.ok) {
      this.emit("error", await req.text());
    }
    const service = await req.json();
    return service;
  }
  async #service(config, service_meta) {
    const url = new URL(service_meta.url);
    if (define_process_default.env.DEBUG)
      console.error(String(url));
    const req = await Fetch(config, url);
    if (!req.ok) {
      this.emit("error", await req.text());
    }
    const service = await req.json();
    return service;
  }
  async #folders(config, folders) {
    const services = [];
    for (const folder of folders) {
      const url = new URL(this.baseUrl);
      url.pathname = url.pathname + "/" + folder;
      if (define_process_default.env.DEBUG)
        console.error(String(url));
      let req = await Fetch(config, url);
      if (!req.ok) {
        this.emit("error", await req.text());
        return services;
      }
      req = await req.json();
      if (req.folders && Array.isArray(req.folders) && req.folders.length) {
        services.push(...await this.#folders(config, req.folders));
      }
      services.push(...req.services.map((service) => {
        const url2 = new URL(this.baseUrl);
        url2.pathname = url2.pathname + "/" + service.name + "/" + service.type;
        return {
          url: url2,
          name: service.name,
          type: service.type
        };
      }));
    }
    return services;
  }
};

// node_modules/esri-dump/dist/index.js
var import_node_events3 = __toESM(require_node_events(), 1);

// node_modules/esri-dump/dist/lib/rewind.js
init_define_process();
function rewind(gj, outer) {
  const type = gj && gj.type;
  if (type === "FeatureCollection") {
    gj = gj;
    for (let i = 0; i < gj.features.length; i++)
      rewind(gj.features[i], outer);
  } else if (type === "GeometryCollection") {
    gj = gj;
    for (let i = 0; i < gj.geometries.length; i++)
      rewind(gj.geometries[i], outer);
  } else if (type === "Feature") {
    gj = gj;
    rewind(gj.geometry, outer);
  } else if (type === "Polygon") {
    gj = gj;
    rewindRings(gj.coordinates, outer);
  } else if (type === "MultiPolygon") {
    gj = gj;
    for (let i = 0; i < gj.coordinates.length; i++)
      rewindRings(gj.coordinates[i], outer);
  }
  return gj;
}
function rewindRings(rings, outer) {
  if (rings.length === 0)
    return;
  rewindRing(rings[0], outer);
  for (let i = 1; i < rings.length; i++) {
    rewindRing(rings[i], !outer);
  }
}
function rewindRing(ring, dir) {
  let area = 0, err = 0;
  for (let i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
    const k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1]);
    const m = area + k;
    err += Math.abs(area) >= Math.abs(k) ? area - m + k : k - m + area;
    area = m;
  }
  if (area + err >= 0 !== !!dir)
    ring.reverse();
}

// node_modules/esri-dump/dist/index.js
var SUPPORTED = ["FeatureServer", "MapServer"];
var EsriDumpConfigApproach;
(function(EsriDumpConfigApproach2) {
  EsriDumpConfigApproach2["BBOX"] = "bbox";
  EsriDumpConfigApproach2["ITER"] = "iter";
  EsriDumpConfigApproach2["TOP_FEATURES_BBOX"] = "top_features_bbox";
  EsriDumpConfigApproach2["TOP_FEATURES_ITER"] = "top_features_iter";
})(EsriDumpConfigApproach || (EsriDumpConfigApproach = {}));
var EsriResourceType;
(function(EsriResourceType2) {
  EsriResourceType2["FeatureServer"] = "FeatureServer";
  EsriResourceType2["MapServer"] = "MapServer";
})(EsriResourceType || (EsriResourceType = {}));
var EsriDump = class extends import_node_events3.default {
  url;
  config;
  geomType;
  resourceType;
  constructor(url, config = {}) {
    super();
    this.url = new URL(url);
    this.config = {
      approach: config.approach || EsriDumpConfigApproach.BBOX,
      headers: config.headers || {},
      params: config.params || {}
    };
    if (!this.url.pathname.includes("/rest/services/"))
      throw new PublicError(400, null, "Did not recognize " + url + " as an ArcGIS /rest/services/ endpoint.");
    this.geomType = null;
    const occurrence = SUPPORTED.map((d) => {
      return url.lastIndexOf(d);
    });
    const known = SUPPORTED[occurrence.indexOf(Math.max.apply(null, occurrence))];
    if (known === "MapServer")
      this.resourceType = EsriResourceType.MapServer;
    else if (known === "FeatureServer")
      this.resourceType = EsriResourceType.FeatureServer;
    else
      throw new PublicError(400, null, "Unknown or unsupported ESRI URL Format");
    this.emit("type", this.resourceType);
  }
  async schema() {
    const metadata = await this.#fetchMeta();
    return FieldToSchema(metadata);
  }
  async discover() {
    try {
      const discover = new Discovery(this.url);
      discover.fetch(this.config);
      discover.on("layer", (layer) => {
        this.emit("layer", layer);
      }).on("schema", (schema) => {
        this.emit("schema", schema);
      }).on("error", (error) => {
        this.emit("error", error);
      }).on("done", () => {
        this.emit("done");
      });
    } catch (err) {
      this.emit("error", err);
    }
  }
  async fetch(config) {
    if (!config)
      config = {};
    const metadata = await this.#fetchMeta();
    try {
      const geom = new Geometry(this.url, metadata);
      geom.fetch(this.config);
      geom.on("feature", (feature) => {
        feature = rewind(feature);
        if (config.map)
          feature = config.map(geom, feature);
        this.emit("feature", feature);
      }).on("error", (error) => {
        this.emit("error", error);
      }).on("done", () => {
        this.emit("done");
      });
    } catch (err) {
      this.emit("error", err);
    }
  }
  async #fetchMeta() {
    const url = new URL(this.url);
    if (define_process_default.env.DEBUG)
      console.error(String(url));
    const res = await Fetch(this.config, url);
    if (!res.ok)
      this.emit("error", await res.text());
    const metadata = await res.json();
    if (metadata.error) {
      return this.emit("error", new PublicError(400, null, "Server metadata error: " + metadata.error.message));
    } else if (metadata.capabilities && metadata.capabilities.indexOf("Query") === -1) {
      return this.emit("error", new PublicError(400, null, "Layer doesn't support query operation."));
    } else if (metadata.folders || metadata.services) {
      let errorMessage = "Endpoint provided is not a Server resource.\n";
      if (metadata.folders.length > 0) {
        errorMessage += "\nChoose a Layer from a Service in one of these Folders: \n  " + metadata.folders.join("\n  ") + "\n";
      }
      if (metadata.services.length > 0 && Array.isArray(metadata.services)) {
        errorMessage += "\nChoose a Layer from one of these Services: \n  " + metadata.services.map((d) => {
          return d.name;
        }).join("\n  ") + "\n";
      }
      return this.emit("error", new PublicError(400, null, errorMessage));
    } else if (metadata.layers) {
      let errorMessage = "Endpoint provided is not a Server resource.\n";
      if (metadata.layers.length > 0 && Array.isArray(metadata.layers)) {
        errorMessage += "\nChoose one of these Layers: \n  " + metadata.layers.map((d) => {
          return d.name;
        }).join("\n  ") + "\n";
      }
      return this.emit("error", new PublicError(400, null, errorMessage));
    } else if (!this.resourceType) {
      return this.emit("error", new PublicError(400, null, "Could not determine server type of " + url));
    }
    this.geomType = metadata.geometryType;
    if (!this.geomType) {
      return this.emit("error", new PublicError(400, null, "no geometry"));
    } else if (!metadata.extent) {
      return this.emit("error", new PublicError(400, null, "Layer doesn't list an extent."));
    } else if ("subLayers" in metadata && metadata.subLayers.length > 0) {
      return this.emit("error", new PublicError(400, null, "Specified layer has sublayers."));
    }
    return metadata;
  }
};

// index.js
var index_default = EsriDump;
export {
  index_default as default
};
