import * as sourceMapSupport from 'source-map-support'
function callsites() {
  const _prepareStackTrace = Error.prepareStackTrace
  try {
    let result: NodeJS.CallSite[] = []
    Error.prepareStackTrace = (_, callSites) => {
      const callSitesWithoutCurrent = callSites.slice(1)
      result = callSitesWithoutCurrent
      return callSitesWithoutCurrent
    }
    new Error('').stack
    return result
  } finally {
    Error.prepareStackTrace = _prepareStackTrace
  }
}

type SourceMapCallSite = Parameters<typeof sourceMapSupport.wrapCallSite>[0]

export function callSiteCapture(frameIdx = 0, skipFileNameAt = 0) {
  const stackTrace = callsites()
  // Skip the callSiteCapture function itself, then apply frameIdx
  const targetFrameIdx = frameIdx + 1
  const callSite = stackTrace[targetFrameIdx]
  
  if (!callSite) {
    // Handle case where frame index is beyond stack depth
    return {
      callerInfo: 'unknown (unknown:0:0)',
      functionName: 'unknown',
      stackFrames: {
        frame: [],
      },
    }
  }
  
  const wrappedCallSite = sourceMapSupport.wrapCallSite(callSite as SourceMapCallSite)
  const functionName = wrappedCallSite.getFunctionName() ?? 'unknown'
  const fileName = wrappedCallSite?.getFileName() ?? ''
  const baseFileName = fileName.substring(skipFileNameAt)
  const lineNumber = wrappedCallSite.getLineNumber() ?? 0

  return {
    callerInfo: `${functionName} (${baseFileName}:${lineNumber}:${wrappedCallSite.getColumnNumber()})`,
    functionName,
    stackFrames: {
      frame: stackTrace.slice(targetFrameIdx).map((s) => {
        const _s = sourceMapSupport.wrapCallSite(s as SourceMapCallSite)
        return {
          functionName: _s.getFunctionName() ?? 'unknown',
          fileName: _s.getFileName() ?? 'unknown',
          lineNumber: _s?.getLineNumber()?.toString(),
          columnNumber: _s?.getColumnNumber()?.toString(),
        }
      }),
    },
  }
}
