'use strict';

var sourceMapSupport = require('source-map-support');

function _interopNamespaceDefault(e) {
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var sourceMapSupport__namespace = /*#__PURE__*/_interopNamespaceDefault(sourceMapSupport);

function callsites() {
  const _prepareStackTrace = Error.prepareStackTrace;
  try {
    let result = [];
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1);
      result = callSitesWithoutCurrent;
      return callSitesWithoutCurrent;
    };
    new Error("").stack;
    return result;
  } finally {
    Error.prepareStackTrace = _prepareStackTrace;
  }
}
function callSiteCapture(frameIdx = 0, skipFileNameAt = 0) {
  const stackTrace = callsites();
  const targetFrameIdx = frameIdx + 1;
  const callSite = stackTrace[targetFrameIdx];
  if (!callSite) {
    return {
      callerInfo: "unknown (unknown:0:0)",
      functionName: "unknown",
      stackFrames: {
        frame: []
      }
    };
  }
  const wrappedCallSite = sourceMapSupport__namespace.wrapCallSite(callSite);
  const functionName = wrappedCallSite.getFunctionName() ?? "unknown";
  const fileName = wrappedCallSite?.getFileName() ?? "";
  const baseFileName = fileName.substring(skipFileNameAt);
  const lineNumber = wrappedCallSite.getLineNumber() ?? 0;
  return {
    callerInfo: `${functionName} (${baseFileName}:${lineNumber}:${wrappedCallSite.getColumnNumber()})`,
    functionName,
    stackFrames: {
      frame: stackTrace.slice(targetFrameIdx).map((s) => {
        const _s = sourceMapSupport__namespace.wrapCallSite(s);
        return {
          functionName: _s.getFunctionName() ?? "unknown",
          fileName: _s.getFileName() ?? "unknown",
          lineNumber: _s?.getLineNumber()?.toString(),
          columnNumber: _s?.getColumnNumber()?.toString()
        };
      })
    }
  };
}

exports.callSiteCapture = callSiteCapture;
