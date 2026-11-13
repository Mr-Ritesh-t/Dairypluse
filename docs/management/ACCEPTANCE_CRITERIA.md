# DairyPulse Formal Acceptance Criteria

All user stories must satisfy these testable Given-When-Then criteria prior to release.

---

## 1. Feature: 10:00 PM Delivery Cutoff Enforcement
```gherkin
Feature: Morning Delivery Modification Cutoff

  Scenario: Customer pauses morning milk before 10:00 PM the night before
    Given customer has an active subscription for "Cow Milk (1.5L)"
    And the current local time is 08:30 PM (20:30)
    When customer submits a skip request for tomorrow's morning delivery
    Then the system accepts the skip request with HTTP 200
    And the customer balance is credited by 1.5 * unit_price
    And no delivery task is generated for tomorrow's morning run.

  Scenario: Customer attempts to pause morning milk after 10:00 PM the night before
    Given customer has an active subscription for "Cow Milk (1.5L)"
    And the current local time is 10:15 PM (22:15)
    When customer submits a skip request for tomorrow's morning delivery with is_admin_override=False
    Then the system rejects the request with HTTP 400 Bad Request
    And the response error details explain: "10:00 PM Cut-off exceeded: Morning deliveries for tomorrow are locked."

  Scenario: Dairy Owner emergency override after 10:00 PM
    Given the current local time is 11:30 PM (23:30)
    When dairy owner submits a skip request with is_admin_override=True
    Then the system accepts the skip with HTTP 200
    And route dispatch logs reflect the administrative change.
```

---

## 2. Feature: Online Payment Gateway & Ledger Reconciliation
```gherkin
Feature: Online Payment Reconciliation

  Scenario: Successful customer UPI payment for outstanding invoice
    Given customer "Vikram Adhav" has an outstanding balance of ₹1,250.00
    And an unpaid invoice INV-2026-001 for ₹1,250.00 exists
    When customer initializes online payment of ₹500.00 via /api/v1/payments/create-order
    Then a PaymentTransaction is created in PENDING status with gateway order ID starting with "order_rzp_"
    When gateway verification webhook is received with valid signature via /api/v1/payments/verify
    Then PaymentTransaction status transitions to "SUCCESS"
    And customer balance is updated to exactly ₹750.00 (1250 - 500)
    And transaction history reflects the verified payment ID.
```

---

## 3. Feature: Prepaid Delinquency Guard
```gherkin
Feature: Prepaid Delivery Generation

  Scenario: Prepaid customer with delinquent balance is excluded from daily dispatch
    Given customer "Sunita Mane" has billing_type="PREPAID"
    And customer outstanding due balance is ₹240.00 (overdrawn account)
    When daily delivery run is generated for tomorrow morning via /api/v1/deliveries/generate-daily
    Then no DeliveryTask is created for "Sunita Mane"
    And the delivery manifest notes customer exclusion due to unpaid prepaid balance.
```
