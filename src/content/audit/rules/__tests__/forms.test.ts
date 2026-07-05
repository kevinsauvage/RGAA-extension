import { describe, it } from 'vitest';
import {
  checkRadioGroups,
  checkFieldsetLegend,
  checkRequiredIndication,
  checkSelectOptgroup,
  checkInvalidFieldHint,
} from '../forms';
import { expectNoFinding, expectRule, setBodyHtml } from './setup';

describe('checkRadioGroups (RGAA 11.5)', () => {
  it('passes when radios are in fieldset', () => {
    setBodyHtml(`
      <fieldset>
        <legend>Genre</legend>
        <input type="radio" name="g" id="m" /><label for="m">M</label>
        <input type="radio" name="g" id="f" /><label for="f">F</label>
      </fieldset>
    `);
    expectNoFinding(checkRadioGroups());
  });

  it('flags ungrouped radio buttons (2+ same name)', () => {
    setBodyHtml(`
      <input type="radio" name="color" value="red" />
      <input type="radio" name="color" value="blue" />
    `);
    expectRule(checkRadioGroups(), 'rgaa-radio-grouping');
  });
});

describe('checkFieldsetLegend (RGAA 11.6)', () => {
  it('passes when fieldset has non-empty legend', () => {
    setBodyHtml(`
      <fieldset>
        <legend>Coordonnées</legend>
        <input type="text" name="street" />
      </fieldset>
    `);
    expectNoFinding(checkFieldsetLegend());
  });

  it('flags fieldset without legend', () => {
    setBodyHtml(`
      <fieldset>
        <input type="text" name="city" />
      </fieldset>
    `);
    expectRule(checkFieldsetLegend(), 'rgaa-fieldset-legend');
  });
});

describe('checkRequiredIndication (RGAA 11.10)', () => {
  it('passes when required input label contains asterisk', () => {
    setBodyHtml(`
      <label for="nom">Nom *</label>
      <input id="nom" required />
    `);
    expectNoFinding(checkRequiredIndication());
  });

  it('flags required input without visible indication in label', () => {
    setBodyHtml(`
      <label for="email">Email</label>
      <input id="email" type="email" required />
    `);
    expectRule(checkRequiredIndication(), 'rgaa-required-indication');
  });
});

describe('checkSelectOptgroup (RGAA 11.8)', () => {
  it('passes when select uses optgroup', () => {
    setBodyHtml(`
      <select>
        <optgroup label="Fruits">
          <option value="a">Pomme</option>
        </optgroup>
      </select>
    `);
    expectNoFinding(checkSelectOptgroup());
  });
});

describe('checkInvalidFieldHint (RGAA 11.11)', () => {
  it('flags aria-invalid field without correction hint', () => {
    setBodyHtml('<input id="name" aria-invalid="true" />');
    expectRule(checkInvalidFieldHint(), 'rgaa-invalid-field-hint');
  });
});
