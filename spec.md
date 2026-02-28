# Specification

## Summary
**Goal:** Remove Aadhaar/PAN KYC from the USDT P2P Exchange, add seller UPI/bank/IFSC payment details to sell orders, and auto-route platform profit to the platform wallet on escrow release.

**Planned changes:**
- Remove all PAN/Aadhaar KYC fields from the backend data model; keep only Level 0 (default, no KYC upgrade path)
- Remove `submitKyc`/`updateKyc` backend functions and KYC approval/rejection admin functions related to PAN/Aadhaar
- Remove `KycSubmissionPage` and `KycManagementPage` from the frontend and navigation; replace dynamic KYC status with a static "Level 0 — Verified" badge
- Add `upiId`, `bankAccountNumber`, and `ifscCode` fields to the sell order data model; require all three in `createSellOrder`
- Update Create Sell Order form with UPI ID, Bank Account Number, and IFSC Code fields with inline validation (UPI must contain `@`, IFSC must be 11 alphanumeric chars, bank account non-empty)
- Display seller payment details in a copyable, monospaced "Seller Payment Details" card on the buyer's active order detail view (hidden after order completion)
- Update escrow release logic to deduct platform profit spread, credit net USDT to buyer's wallet, route profit to platform profit wallet, and create a ledger entry with orderId, buyerPrincipal, usdtReleasedToBuyer, profitAmount, and timestamp

**User-visible outcome:** Sellers must provide UPI/bank/IFSC details when creating a sell order; buyers see those payment details during an active trade. KYC submission is gone entirely — all users show Level 0. On escrow release, profit is automatically split to the platform wallet and the remainder goes to the buyer.
