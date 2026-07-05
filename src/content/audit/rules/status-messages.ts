import { auditQueryAll } from '../audit-context';
import { isVisible } from '../dom-utils';
import { multiNodeFinding, type RuleFinding } from './shared';

const STATUS_CLASS_HINT =
  /toast|snackbar|notification|flash-message|status-message|alert-success|alert-info|banner-message/i;

/** RGAA 7.5 (partial) — status regions that look dynamic but lack live-region semantics. */
export function checkStatusMessages(): RuleFinding | null {
  const offenders: Element[] = [];

  for (const el of auditQueryAll<HTMLElement>('[class], [role="status"], [role="alert"]')) {
    if (!isVisible(el)) continue;

    const role = el.getAttribute('role');
    const live = el.getAttribute('aria-live');
    if (role === 'status' || role === 'alert' || (live && live !== 'off')) continue;
    if (el.closest('[aria-live]:not([aria-live="off"]), [role="status"], [role="alert"]')) {
      continue;
    }

    const classHint = typeof el.className === 'string' && STATUS_CLASS_HINT.test(el.className);
    const explicitStatus = el.hasAttribute('data-status') || el.hasAttribute('data-toast');
    if (!classHint && !explicitStatus) continue;

    offenders.push(el);
  }

  return multiNodeFinding(offenders, {
    criterion: '7.5',
    ruleId: 'rgaa-status-messages',
    severity: 'moderate',
    title: 'Message de statut sans restitution aux technologies d’assistance',
    description:
      'Des zones de message (toast, notification, bannière) n’ont pas role="status", role="alert" ni aria-live.',
    userImpact:
      'Les utilisateurs de lecteur d’écran ne sont pas informés des mises à jour dynamiques de la page.',
  });
}
