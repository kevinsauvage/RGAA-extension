import { describe, expect, it } from 'vitest';
import { classifyScanError, formatScanError } from '../scan-errors';

describe('scan-errors', () => {
  it('classifies quota errors', () => {
    expect(classifyScanError('limit reached', 'quota')).toBe('quota');
  });

  it('classifies extension injection errors as protected pages', () => {
    expect(
      classifyScanError(
        'Cannot access contents of url "chrome-extension://abc/src/options/index.html". Extension manifest must request permission to access this host.',
      ),
    ).toBe('protected');
  });

  it('classifies injection errors', () => {
    expect(classifyScanError('Could not establish connection. Receiving end does not exist.')).toBe(
      'injection',
    );
  });

  it('formats protected page in French', () => {
    const msg = formatScanError('fr', 'unsupported URL');
    expect(msg).toContain('chrome://');
  });
});
