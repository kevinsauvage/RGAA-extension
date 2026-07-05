import { describe, it } from 'vitest';
import { checkDoctype, checkTextDirection } from '../mandatory';
import { expectNoFinding, expectRule, mockDoctype, setBodyHtml } from './setup';

describe('checkDoctype (RGAA 8.1)', () => {
  it('passes when HTML doctype is present', () => {
    mockDoctype('html');
    expectNoFinding(checkDoctype());
  });

  it('flags missing doctype', () => {
    mockDoctype(null);
    expectRule(checkDoctype(), 'rgaa-doctype');
  });

  it('flags non-HTML doctype', () => {
    mockDoctype('xml');
    expectRule(checkDoctype(), 'rgaa-doctype');
  });
});

describe('checkTextDirection (RGAA 8.10)', () => {
  it('passes for LTR page with LTR text', () => {
    setBodyHtml('<p>Hello world, this is English content.</p>');
    expectNoFinding(checkTextDirection());
  });

  it('passes when RTL passage has dir="rtl"', () => {
    setBodyHtml('<p dir="rtl">שלום עולם זהו טקסט בעברית</p>');
    expectNoFinding(checkTextDirection());
  });

  it('flags RTL text without dir on LTR page', () => {
    setBodyHtml('<p>שלום עולם זהו טקסט בעברית ארוכה</p>');
    expectRule(checkTextDirection(), 'rgaa-text-direction');
  });

  it('ignores very short text snippets', () => {
    setBodyHtml('<p>مرحبا</p>');
    expectNoFinding(checkTextDirection());
  });

  it('flags long English text inside RTL container without dir override', () => {
    document.documentElement.setAttribute('dir', 'rtl');
    setBodyHtml('<p>This is a long English paragraph without dir attribute.</p>');
    expectRule(checkTextDirection(), 'rgaa-text-direction');
  });
});
