declare function callSiteCapture(frameIdx?: number, skipFileNameAt?: number): {
    callerInfo: string;
    functionName: string;
    stackFrames: {
        frame: {
            functionName: string;
            fileName: string;
            lineNumber: string | undefined;
            columnNumber: string | undefined;
        }[];
    };
};

export { callSiteCapture };
