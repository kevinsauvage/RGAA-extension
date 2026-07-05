import { describe, it } from 'vitest';
import { checkStatusMessages } from '../status-messages';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkStatusMessages (RGAA 7.5)', () => {
  it('passes when toast uses role=status', () => {
    setBodyHtml('<div class="toast" role="status">Enregistré</div>');
    expectNoFinding(checkStatusMessages());
  });

  it('passes when notification has aria-live', () => {
    setBodyHtml('<div class="notification" aria-live="polite">Mise à jour</div>');
    expectNoFinding(checkStatusMessages());
  });

  it('flags toast-like region without live semantics', () => {
    setBodyHtml('<div class="toast">Enregistré avec succès</div>');
    expectRule(checkStatusMessages(), 'rgaa-status-messages');
  });

  it('ignores hidden status-like elements', () => {
    setBodyHtml('<div class="toast" style="display:none">Hidden</div>');
    expectNoFinding(checkStatusMessages());
  });
});
