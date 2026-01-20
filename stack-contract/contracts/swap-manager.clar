(define-data-var admin principal tx-sender)

(define-map stx-balances principal uint)

(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u200))
    (ok (var-set admin new-admin))
  )
)

;; This is a SIMPLIFIED swap mock for MVP
;; Real version would integrate Alex or Arkadiko DEX

(define-public (swap-usdcx-to-stx (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u201))

    (let (
      (current (default-to u0 (map-get? stx-balances user)))
    )
      (map-set stx-balances user (+ current amount))
      (ok true)
    )
  )
)

(define-read-only (get-stx-balance (user principal))
  (ok (default-to u0 (map-get? stx-balances user)))
)
