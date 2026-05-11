export function OwnerStepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="cc-stepper" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={3}>
      {[1, 2, 3].map((n) => (
        <span key={n} className={`cc-stepper-bar${n <= step ? ' is-on' : ''}`} />
      ))}
    </div>
  )
}
