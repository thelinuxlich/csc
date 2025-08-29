# CSC (Call Site Capture)

A TypeScript utility library for capturing detailed call site information with source map support. This library provides accurate stack trace information, making it invaluable for debugging, logging, and error reporting in TypeScript/JavaScript applications.

## Features

- 🎯 **Precise Call Site Information** - Capture exact function names, file paths, and line/column numbers
- 🗺️ **Source Map Support** - Get accurate locations in original TypeScript files, not transpiled JavaScript
- 📚 **Full Stack Trace** - Access complete stack frame information for deep debugging
- ⚡ **Lightweight** - Minimal dependencies with focused functionality
- 🔧 **Configurable** - Customize frame selection and filename formatting
- 📝 **TypeScript Ready** - Full TypeScript support with proper type definitions

## Installation

```bash
pnpm add @thelinuxlich/csc
```

## Usage

### Basic Usage

```typescript
import { callSiteCapture } from 'csc';

function myFunction() {
  const callInfo = callSiteCapture();
  console.log(callInfo.callerInfo);
  // Output: "myFunction (src/example.ts:4:23)"
}

myFunction();
```

### Advanced Usage

```typescript
import { callSiteCapture } from 'csc';

function deepFunction() {
  // Capture the caller's caller (skip 1 frame)
  const callInfo = callSiteCapture(1);
  
  console.log('Function:', callInfo.functionName);
  console.log('Location:', callInfo.callerInfo);
  console.log('All frames:', callInfo.stackFrames.frame.length);
}

function intermediateFunction() {
  deepFunction();
}

function topLevelFunction() {
  intermediateFunction(); // This will be captured when frameIdx=1
}

topLevelFunction();
```

### Filename Trimming

```typescript
import { callSiteCapture } from 'csc';

function example() {
  // Skip the first 20 characters of the filename
  const callInfo = callSiteCapture(0, 20);
  console.log(callInfo.callerInfo);
  // Instead of: "example (/very/long/path/to/src/example.ts:5:10)"
  // Shows: "example (src/example.ts:5:10)"
}
```

## API Reference

### `callSiteCapture(frameIdx?, skipFileNameAt?)`

Captures detailed information about a specific call site in the stack trace.

#### Parameters

- `frameIdx` (number, optional): The stack frame index to capture (default: 0)
  - `0`: Current function
  - `1`: Calling function
  - `2`: Caller's caller, etc.
- `skipFileNameAt` (number, optional): Number of characters to skip from the beginning of the filename (default: 0)

#### Returns

An object containing:

```typescript
{
  callerInfo: string;       // Formatted string: "functionName (file:line:column)"
  functionName: string;     // Raw function name
  stackFrames: {
    frame: Array<{
      functionName: { value: string };
      fileName: { value: string };
      lineNumber: string;
      columnNumber: string;
    }>;
  };
}
```

#### Example Return Value

```typescript
{
  callerInfo: "myFunction (src/example.ts:15:23)",
  functionName: "myFunction",
  stackFrames: {
    frame: [
      {
        functionName: "myFunction",
        fileName: "/project/src/example.ts",
        lineNumber: "15",
        columnNumber: "23"
      },
      {
        functionName: "main",
        fileName: "/project/src/index.ts",
        lineNumber: "8",
        columnNumber: "5"
      }
      // ... more frames
    ]
  }
}
```

## Use Cases

### Debugging and Logging

```typescript
import { callSiteCapture } from 'csc';

function logger(message: string) {
  const callInfo = callSiteCapture(1); // Get caller info
  console.log(`[${callInfo.callerInfo}] ${message}`);
}

function businessLogic() {
  logger("Processing started");
  // Output: [businessLogic (src/business.ts:12:3)] Processing started
}
```

### Error Reporting

```typescript
import { callSiteCapture } from 'csc';

function reportError(error: Error) {
  const callInfo = callSiteCapture(1);
  
  return {
    error: error.message,
    location: callInfo.callerInfo,
    stackTrace: callInfo.stackFrames.frame.map(frame => ({
      function: frame.functionName,
      file: frame.fileName,
      line: frame.lineNumber,
      column: frame.columnNumber
    }))
  };
}
```

### Development Tools

```typescript
import { callSiteCapture } from 'csc';

function performanceTracker<T>(fn: () => T): T {
  const callInfo = callSiteCapture(1);
  const start = performance.now();
  
  try {
    return fn();
  } finally {
    const duration = performance.now() - start;
    console.log(`${callInfo.functionName} took ${duration.toFixed(2)}ms`);
  }
}
```

## Requirements

- Node.js 12+ or modern browser environment
- TypeScript 4.0+ (for TypeScript projects)

## Dependencies

- [`source-map-support`](https://www.npmjs.com/package/source-map-support): Provides source map support for accurate file locations

## How It Works

The library uses Node.js's `Error.prepareStackTrace` API to capture raw call site information, then enhances it with source map support to provide accurate locations in your original TypeScript files rather than the transpiled JavaScript output.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Related Projects

- [source-map-support](https://github.com/evanw/node-source-map-support) - Fixes stack traces for transpiled code
- [stack-trace](https://github.com/felixge/node-stack-trace) - Get v8 stack traces as an array of CallSite objects