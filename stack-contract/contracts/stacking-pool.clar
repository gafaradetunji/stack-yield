;; title: stacking-pool
;; version:
;; summary:
;; description:

(define-data-var admin principal tx-sender)

(define-map stacked principal uint)

(define-public (stack-for-user (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u300))

    (let (
      (current (default-to u0 (map-get? stacked user)))
    )
      (map-set stacked user (+ current amount))
      (ok true)
    )
  )
)

(define-public (unstake-for-user (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u301))

    (let (
      (current (default-to u0 (map-get? stacked user)))
    )
      (asserts! (>= current amount) (err u302))
      (map-set stacked user (- current amount))
      (ok true)
    )
  )
)

(define-read-only (get-stacked (user principal))
  (ok (default-to u0 (map-get? stacked user)))
)
