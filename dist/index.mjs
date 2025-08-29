import * as sourceMapSupport from 'source-map-support';

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
  const wrappedCallSite = sourceMapSupport.wrapCallSite(callSite);
  const functionName = wrappedCallSite.getFunctionName() ?? "unknown";
  const fileName = wrappedCallSite?.getFileName() ?? "";
  const baseFileName = fileName.substring(skipFileNameAt);
  const lineNumber = wrappedCallSite.getLineNumber() ?? 0;
  return {
    callerInfo: `${functionName} (${baseFileName}:${lineNumber}:${wrappedCallSite.getColumnNumber()})`,
    functionName,
    stackFrames: {
      frame: stackTrace.slice(targetFrameIdx).map((s) => {
        const _s = sourceMapSupport.wrapCallSite(s);
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

export { callSiteCapture };
