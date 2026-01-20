;; Vault Contract
;; Holds USDCx for users

(define-map balances principal uint)
(define-data-var admin principal tx-sender)

;; Events
(define-public (set-admin (new-admin principal))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u100))
    (ok (var-set admin new-admin))
  )
)

(define-public (credit-user (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u101))

    (let (
      (current (default-to u0 (map-get? balances user)))
    )
      (map-set balances user (+ current amount))
      (ok true)
    )
  )
)

(define-public (debit-user (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u102))

    (let (
      (current (default-to u0 (map-get? balances user)))
    )
      (asserts! (>= current amount) (err u103))
      (map-set balances user (- current amount))
      (ok true)
    )
  )
)

(define-read-only (get-balance (user principal))
  (ok (default-to u0 (map-get? balances user)))
)
