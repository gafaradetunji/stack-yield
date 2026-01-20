;; title: rewards-ledger
;; version:
;; summary:
;; description:

(define-data-var admin principal tx-sender)

(define-map rewards principal uint)

(define-public (credit-reward (user principal) (amount uint))
  (begin
    (asserts! (is-eq tx-sender (var-get admin)) (err u400))

    (let (
      (current (default-to u0 (map-get? rewards user)))
    )
      (map-set rewards user (+ current amount))
      (ok true)
    )
  )
)

(define-public (claim-reward (amount uint))
  (let (
    (current (default-to u0 (map-get? rewards tx-sender)))
  )
    (asserts! (>= current amount) (err u401))
    (map-set rewards tx-sender (- current amount))
    (ok true)
  )
)

(define-read-only (get-reward (user principal))
  (ok (default-to u0 (map-get? rewards user)))
)
