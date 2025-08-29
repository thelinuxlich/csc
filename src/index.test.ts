import { describe, it, expect } from 'vitest'
import { callSiteCapture } from './index'

describe('callSiteCapture', () => {
  it('should capture basic call site information', () => {
    function testFunction() {
      return callSiteCapture()
    }

    const result = testFunction()

    expect(result).toHaveProperty('callerInfo')
    expect(result).toHaveProperty('functionName')
    expect(result).toHaveProperty('stackFrames')
    expect(result.stackFrames).toHaveProperty('frame')
    expect(Array.isArray(result.stackFrames.frame)).toBe(true)
  })

  it('should return correct function name', () => {
    function namedTestFunction() {
      return callSiteCapture()
    }

    const result = namedTestFunction()

    expect(result.functionName).toBe('namedTestFunction')
    expect(result.callerInfo).toContain('namedTestFunction')
  })

  it('should capture caller information with file path and line number', () => {
    function testCaller() {
      return callSiteCapture()
    }

    const result = testCaller()

    expect(result.callerInfo).toMatch(/testCaller \(.+:\d+:\d+\)/)
    expect(result.callerInfo).toContain('testCaller')
    expect(result.callerInfo).toContain('.ts')
  })

  it('should capture different frame indices', () => {
    function level1() {
      return callSiteCapture(1)
    }

    function level2() {
      return level1()
    }

    const result = level2()

    expect(result.functionName).toBe('level2')
    expect(result.callerInfo).toMatch(/level2 \(.+:\d+:\d+\)/)
  })

  it('should handle frame index 0 (current function)', () => {
    function currentFrameTest() {
      return callSiteCapture(0)
    }

    const result = currentFrameTest()

    expect(result.functionName).toBe('currentFrameTest')
  })

  it('should trim filename when skipFileNameAt is provided', () => {
    function filenameTest() {
      return callSiteCapture(0, 10)
    }

    const result = filenameTest()

    expect(result.callerInfo).toMatch(/filenameTest \(.+:\d+:\d+\)/)

    const match = result.callerInfo.match(/\((.+):\d+:\d+\)/)
    if (match) {
      const filename = match[1]
      expect(filename.length).toBeLessThan(100)
    }
  })

  it('should return stack frames with correct structure', () => {
    function stackFrameTest() {
      return callSiteCapture()
    }

    const result = stackFrameTest()

    expect(result.stackFrames.frame.length).toBeGreaterThan(0)
    
    const firstFrame = result.stackFrames.frame[0]
    expect(firstFrame).toHaveProperty('functionName')
    expect(firstFrame).toHaveProperty('fileName')
    expect(firstFrame).toHaveProperty('lineNumber')
    expect(firstFrame).toHaveProperty('columnNumber')
    
    expect(typeof firstFrame.functionName).toBe('string')
    expect(typeof firstFrame.fileName).toBe('string')
    expect(typeof firstFrame.lineNumber).toBe('string')
    expect(typeof firstFrame.columnNumber).toBe('string')
  })

  it('should handle nested function calls correctly', () => {
    function deepLevel3() {
      return callSiteCapture(2) // Skip 2 frames to get deepLevel1
    }

    function deepLevel2() {
      return deepLevel3()
    }

    function deepLevel1() {
      return deepLevel2()
    }

    const result = deepLevel1()

    expect(result.functionName).toBe('deepLevel1')
  })

  it('should handle anonymous functions gracefully', () => {
    const anonymousFunction = function() {
      return callSiteCapture()
    }

    const result = anonymousFunction()

    expect(typeof result.functionName).toBe('string')
    expect(result.functionName.length).toBeGreaterThan(0)
  })

  it('should return consistent structure across multiple calls', () => {
    function consistencyTest() {
      return callSiteCapture()
    }

    const result1 = consistencyTest()
    const result2 = consistencyTest()

    expect(Object.keys(result1)).toEqual(Object.keys(result2))
    expect(Object.keys(result1.stackFrames)).toEqual(Object.keys(result2.stackFrames))
    expect(result1.functionName).toBe(result2.functionName)
    expect(result1.callerInfo).toBe(result2.callerInfo)
  })

  it('should handle edge case with large frame index gracefully', () => {
    function edgeCaseTest() {
      return callSiteCapture(100)
    }

    expect(() => edgeCaseTest()).not.toThrow()
  })

  it('should capture line and column numbers as strings', () => {
    function lineColumnTest() {
      return callSiteCapture()
    }

    const result = lineColumnTest()

    const firstFrame = result.stackFrames.frame[0]
    expect(typeof firstFrame.lineNumber).toBe('string')
    expect(typeof firstFrame.columnNumber).toBe('string')
    
    const lineNum = firstFrame.lineNumber || '0'
    const colNum = firstFrame.columnNumber || '0'
    expect(parseInt(lineNum)).toBeGreaterThan(0)
    expect(parseInt(colNum)).toBeGreaterThan(0)
  })

  it('should include multiple stack frames', () => {
    function multiFrameLevel3() {
      return callSiteCapture()
    }

    function multiFrameLevel2() {
      return multiFrameLevel3()
    }

    function multiFrameLevel1() {
      return multiFrameLevel2()
    }

    const result = multiFrameLevel1()

    expect(result.stackFrames.frame.length).toBeGreaterThanOrEqual(3)
    expect(result.stackFrames.frame[0].functionName).toBe('multiFrameLevel3')
    expect(result.stackFrames.frame[1].functionName).toBe('multiFrameLevel2')
    expect(result.stackFrames.frame[2].functionName).toBe('multiFrameLevel1')
  })

  it('should handle default parameters correctly', () => {
    function defaultParamTest() {
      return callSiteCapture()
    }

    const result = defaultParamTest()

    expect(result.functionName).toBe('defaultParamTest')
    expect(result.callerInfo).toContain('defaultParamTest')
  })

  it('should provide meaningful caller info format', () => {
    function callerInfoTest() {
      return callSiteCapture()
    }

    const result = callerInfoTest()

    expect(result.callerInfo).toMatch(/^.+ \(.+:\d+:\d+\)$/)
    expect(result.callerInfo).toContain('callerInfoTest')
  })

  it('should handle unknown function names', () => {
    const result = callSiteCapture()

    expect(typeof result.functionName).toBe('string')
    expect(result.functionName.length).toBeGreaterThan(0)
  })

  it('should handle filename trimming correctly', () => {
    function trimTest() {
      const result1 = callSiteCapture(0, 0)
      const result2 = callSiteCapture(0, 20)
      
      const match1 = result1.callerInfo.match(/\((.+):\d+:\d+\)/)
      const match2 = result2.callerInfo.match(/\((.+):\d+:\d+\)/)
      
      if (match1 && match2) {
        const filename1 = match1[1]
        const filename2 = match2[1]
        expect(filename2.length).toBeLessThanOrEqual(filename1.length)
      }
    }

    trimTest()
  })
})