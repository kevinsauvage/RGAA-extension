import { describe, it } from 'vitest';
import { checkColorOnlyRequired } from '../colors';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkColorOnlyRequired (RGAA 3.1)', () => {
  it('passes when required field label mentions "obligatoire"', () => {
    setBodyHtml(`
      <label for="email">Email (obligatoire)</label>
      <input id="email" type="email" required />
    `);
    expectNoFinding(checkColorOnlyRequired());
  });

  it('passes when required field label contains asterisk in text', () => {
    setBodyHtml(`
      <label for="name">Nom *</label>
      <input id="name" type="text" required />
    `);
    expectNoFinding(checkColorOnlyRequired());
  });

  it('passes when aria-required field has aria-label with "required"', () => {
    setBodyHtml(`
      <input type="text" aria-required="true" aria-label="Code postal (required)" />
    `);
    expectNoFinding(checkColorOnlyRequired());
  });

  it('flags required field with visual asterisk marker only', () => {
    setBodyHtml(`
      <div class="form-group">
        <label for="phone">Téléphone</label>
        <span class="required">*</span>
        <input id="phone" type="tel" required />
      </div>
    `);
    expectRule(checkColorOnlyRequired(), 'rgaa-color-only-required');
  });

  it('flags aria-required with asterisk class marker but no textual cue', () => {
    setBodyHtml(`
      <div class="field">
        <label for="city">Ville</label>
        <span class="asterisk">*</span>
        <input id="city" aria-required="true" />
      </div>
    `);
    expectRule(checkColorOnlyRequired(), 'rgaa-color-only-required');
  });

  it('passes for non-required fields even with asterisk decoration elsewhere', () => {
    setBodyHtml(`
      <div class="form-group">
        <label for="note">Note facultative</label>
        <input id="note" type="text" />
      </div>
    `);
    expectNoFinding(checkColorOnlyRequired());
  });

  it('ignores hidden required fields', () => {
    setBodyHtml(`
      <div class="form-group">
        <label for="hidden">Champ</label>
        <span class="required">*</span>
        <input id="hidden" type="text" required style="display:none" />
      </div>
    `);
    expectNoFinding(checkColorOnlyRequired());
  });

  it('ignores marker with descriptive text beyond asterisk', () => {
    setBodyHtml(`
      <div class="form-group">
        <label for="age">Âge</label>
        <span class="required">Champ requis visuellement</span>
        <input id="age" type="number" required />
      </div>
    `);
    expectNoFinding(checkColorOnlyRequired());
  });
});
