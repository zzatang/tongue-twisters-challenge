import '@testing-library/jest-dom';
import 'whatwg-fetch';

// Extend expect matchers
import { expect } from '@jest/globals';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

declare global {
  namespace jest {
    interface Matchers<R = void>
      extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
  }
}

// Set up global fetch objects
if (typeof global.Request === 'undefined') {
  global.Request = Request;
  global.Response = Response;
  global.Headers = Headers;
  global.FormData = FormData;
}

// Mock TextEncoder/TextDecoder if not available
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
  global.TextDecoder = require('util').TextDecoder;
}
