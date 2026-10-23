import { useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { availabilityOptions, preferenceOptions, scenarioQuestions } from '../../data/volunteer';
import { site } from '../../data/site';
import { PRIVACY_NOTICE_VERSION } from '../../config/privacy';
import { submitVolunteerApplication } from '../../services/volunteerService';
import { ChoiceGroup, Field } from './Field';
import { emptyValues, fieldLabels, fieldOrder, sectionProgress, validate } from './validation';
import type { FieldKey, SectionProgress, VolunteerFormValues } from './validation';

type Status = 'idle' | 'submitting' | 'success' | 'error';

const fieldIds: Record<FieldKey, string> = {
  fullName: 'fullName',
  age: 'age',
  whatsapp: 'whatsapp',
  email: 'email',
  city: 'city',
  preference1: 'preference1-0',
  preference2: 'preference2-0',
  availability: 'availability-0',
  scenario1: 'scenario1',
  scenario2: 'scenario2',
  scenario3: 'scenario3',
  notes: 'notes',
  consent: 'consent',
};

export function VolunteerForm({ onProgress }: { onProgress?: (p: SectionProgress[]) => void }) {
  const [values, setValues] = useState<VolunteerFormValues>(emptyValues);
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [referenceCode, setReferenceCode] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const startedAt = useRef(Date.now());
  const inFlight = useRef(false);
  const [serverMessage, setServerMessage] = useState('');
  const [prefNotice, setPrefNotice] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const errors = useMemo(() => validate(values), [values]);
  useEffect(() => { onProgress?.(sectionProgress(errors)); }, [errors, onProgress]);
  const shown = (k: FieldKey) => (touched[k] || attempted ? errors[k] : undefined);
  const touch = (k: FieldKey) => () => setTouched((t) => ({ ...t, [k]: true }));
  const set = <K extends FieldKey>(k: K, v: VolunteerFormValues[K]) => setValues((s) => ({ ...s, [k]: v }));

  const errorKeys = fieldOrder.filter((k) => errors[k]);
  const showSummary = attempted && errorKeys.length > 0 && status !== 'success';

  const setPreference1 = (v: string) => {
    const clash = values.preference2 === v;
    setValues((s) => ({ ...s, preference1: v, preference2: clash ? '' : s.preference2 }));
    setPrefNotice(clash ? 'Your second preference was cleared because it matched your first. Choose another.' : '');
    setTouched((t) => ({ ...t, preference1: true }));
  };

  const focusField = (k: FieldKey) => (e: MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(fieldIds[k]);
    el?.focus();
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // blocks accidental double submission while a request is running
    setAttempted(true);
    if (errorKeys.length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    inFlight.current = true;
    setStatus('submitting');
    try {
      const result = await submitVolunteerApplication(values, {
        honeypot,
        elapsedMs: Date.now() - startedAt.current,
      });
      if ('referenceCode' in result) {
        setReferenceCode(result.referenceCode);
        setStatus('success');
      } else {
        setServerMessage(result.message);
        setStatus('error');
      }
    } finally {
      inFlight.current = false;
    }
    requestAnimationFrame(() => resultRef.current?.focus());
  };

  if (status === 'success') {
    return (
      <div className="form-result form-result--ok" ref={resultRef} tabIndex={-1} role="status">
        <span className="form-result__icon"><Check size={28} aria-hidden="true" /></span>
        <h2 className="display-m">Thank you. Your application has been received.</h2>
        <p className="lead">
          The Karwaan Foundation team will contact you about volunteer opportunities. Please keep your
          reference number in case you need to get in touch.
        </p>
        <p className="form-result__ref mono">(Reference number) <strong>{referenceCode}</strong></p>
        <div className="form-result__actions">
          <Button to="/">Back to the home page</Button>
        </div>
      </div>
    );
  }

  return (
    <form className="vform" onSubmit={onSubmit} noValidate aria-describedby="vform-note">
      <p className="form-note mono" id="vform-note">Fields are required unless marked optional.</p>

      <div className="hp" aria-hidden="true">
        <label>Company website<input type="text" name="company_website" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} /></label>
      </div>

      {showSummary && (
        <div className="error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <h2>Fix {errorKeys.length} {errorKeys.length === 1 ? 'field' : 'fields'} to continue</h2>
          <ul>
            {errorKeys.map((k) => (
              <li key={k}>
                <a href={`#${fieldIds[k]}`} onClick={focusField(k)}>{fieldLabels[k]}: {errors[k]}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {status === 'error' && (
        <div className="error-summary" role="alert" tabIndex={-1} ref={resultRef}>
          <h2>Your application was not sent</h2>
          <p>{serverMessage} Your answers are still here. You can try again, or email {site.contact.email}.</p>
        </div>
      )}

      <fieldset className="vform__group" id="vsec-about">
        <legend className="vform__legend"><span className="mono">(1)</span> About you</legend>
        <div className="vform__grid">
          <Field id="fullName" label="Full name" error={shown('fullName')}>
            {(a) => (
              <input {...a} type="text" autoComplete="name" value={values.fullName}
                onChange={(e) => set('fullName', e.target.value)} onBlur={touch('fullName')} />
            )}
          </Field>
          <Field id="age" label="Age" error={shown('age')}>
            {(a) => (
              <input {...a} type="text" inputMode="numeric" autoComplete="off" value={values.age}
                onChange={(e) => set('age', e.target.value)} onBlur={touch('age')} />
            )}
          </Field>
          <Field id="whatsapp" label="WhatsApp number" error={shown('whatsapp')}>
            {(a) => (
              <input {...a} type="tel" inputMode="tel" autoComplete="tel" value={values.whatsapp}
                onChange={(e) => set('whatsapp', e.target.value)} onBlur={touch('whatsapp')} />
            )}
          </Field>
          <Field id="email" label="Email address" error={shown('email')}>
            {(a) => (
              <input {...a} type="email" inputMode="email" autoComplete="email" value={values.email}
                onChange={(e) => set('email', e.target.value)} onBlur={touch('email')} />
            )}
          </Field>
          <Field id="city" label="City" error={shown('city')}>
            {(a) => (
              <input {...a} type="text" autoComplete="address-level2" value={values.city}
                onChange={(e) => set('city', e.target.value)} onBlur={touch('city')} />
            )}
          </Field>
        </div>
      </fieldset>

      <fieldset className="vform__group" id="vsec-help">
        <legend className="vform__legend"><span className="mono">(2)</span> Where you would like to help</legend>
        <ChoiceGroup
          name="preference1"
          legend="Where would you most like to contribute? Choose your first preference."
          options={preferenceOptions}
          value={values.preference1}
          onChange={setPreference1}
          onBlur={touch('preference1')}
          error={shown('preference1')}
        />
        <ChoiceGroup
          name="preference2"
          legend="Where would you also be interested in contributing? Choose your second preference."
          hint={prefNotice || 'This must be different from your first preference.'}
          options={preferenceOptions}
          value={values.preference2}
          onChange={(v) => { setPrefNotice(''); set('preference2', v); setTouched((t) => ({ ...t, preference2: true })); }}
          onBlur={touch('preference2')}
          error={shown('preference2')}
          disabled={values.preference1 ? [values.preference1] : []}
          disabledNote="Your first preference cannot be chosen again here."
        />
      </fieldset>

      <fieldset className="vform__group" id="vsec-availability">
        <legend className="vform__legend"><span className="mono">(3)</span> Your availability</legend>
        <ChoiceGroup
          name="availability"
          legend="When are you usually available to volunteer?"
          options={availabilityOptions}
          value={values.availability}
          onChange={(v) => { set('availability', v); setTouched((t) => ({ ...t, availability: true })); }}
          onBlur={touch('availability')}
          error={shown('availability')}
        />
      </fieldset>

      <fieldset className="vform__group" id="vsec-scenarios">
        <legend className="vform__legend"><span className="mono">(4)</span> A few scenarios</legend>
        {scenarioQuestions.map((q) => (
          <Field key={q.key} id={q.key} label={q.prompt} error={shown(q.key)}>
            {(a) => (
              <textarea {...a} rows={4} value={values[q.key]}
                onChange={(e) => set(q.key, e.target.value)} onBlur={touch(q.key)} />
            )}
          </Field>
        ))}
        <Field id="notes" label="Anything else you'd like us to know?" optional>
          {(a) => (
            <textarea {...a} rows={3} value={values.notes} onChange={(e) => set('notes', e.target.value)} />
          )}
        </Field>
      </fieldset>

      <fieldset className="vform__group" id="vsec-consent">
        <legend className="vform__legend"><span className="mono">(5)</span> Privacy and consent</legend>
        <div className="privacy">
          <p className="privacy__flag mono">(Placeholder) The Foundation&rsquo;s final privacy notice will appear here.</p>
          <p>
            <strong>What this form collects.</strong> Your name, age, WhatsApp number, email address, city,
            volunteer preferences, availability and written answers, so the Karwaan Foundation team can
            contact you about volunteer opportunities.
          </p>
          <p>
            <strong>Questions.</strong> Email <a href={site.contact.emailHref}>{site.contact.email}</a>.
            See also <Link to="/contact">our contact page</Link>.
          </p>
          <p className="mono muted">Notice version: {PRIVACY_NOTICE_VERSION}</p>
        </div>

        <div className={`check ${shown('consent') ? 'field--error' : ''}`}>
          <input
            id="consent"
            type="checkbox"
            checked={values.consent}
            aria-invalid={Boolean(shown('consent'))}
            aria-describedby={shown('consent') ? 'consent-error' : undefined}
            onChange={(e) => { set('consent', e.target.checked); setTouched((t) => ({ ...t, consent: true })); }}
          />
          <label htmlFor="consent">
            I have read the privacy notice and agree that Karwaan Foundation may use these details to
            contact me about volunteering.
          </label>
        </div>
        {shown('consent') && (
          <p className="field__error" id="consent-error">
            <span aria-hidden="true" className="field__error-icon">!</span>
            {errors.consent}
          </p>
        )}
      </fieldset>

      <div className="vform__submit">
        <Button type="submit" size="lg" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'Sending…' : 'Submit my interest'}
        </Button>
      </div>
    </form>
  );
}
