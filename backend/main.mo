import Map "mo:core/Map";
import Int "mo:core/Int";
import Float "mo:core/Float";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Debug "mo:core/Debug";

import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinAuthorization "authorization/MixinAuthorization";
import Migration "migration";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);

  include MixinAuthorization(accessControlState);

  module Profile {
    public type UserProfile = {
      username : Text;
      email : Text;
    };

    public type KycInfo = {
      kycLevel : Nat8;
      verified : Bool;
    };

    public type FullProfile = {
      username : Text;
      email : Text;
      kycInfo : KycInfo;
    };
  };

  module Wallets {
    public type Wallet = {
      userBalance : Float;
      escrowBalance : Float;
      profitWallet : Float;
    };

    public func empty() : Wallet {
      {
        userBalance = 0.0;
        escrowBalance = 0.0;
        profitWallet = 0.0;
      };
    };
  };

  module DisputeManagement {
    public type Dispute = {
      disputeId : Nat;
      orderId : Nat;
      disputeType : DisputeType;
    };

    public type DisputeType = {
      #buyerDispute;
      #sellerDispute;
    };
  };

  module Auditing {
    public type AuditTrail = {
      actionType : ActionType;
      timestamp : Int;
    };

    public type ActionType = {
      #deposit;
      #withdrawal;
      #orderPlacement;
      #orderCompletion;
      #disputeRaised;
    };
  };

  module Orders {
    public type Order = {
      orderId : Nat;
      seller : Principal;
      amountUsdt : Float;
      exchangeRate : Float;
      paymentDetails : PaymentDetails;
    };

    public type PaymentDetails = {
      upiId : Text;
      bankAccountNumber : Text;
      ifscCode : Text;
    };

    public type EscrowRelease = {
      orderId : Nat;
      buyer : Principal;
      usdtReleased : Float;
      profitAmount : Float;
      timestamp : Int;
    };
  };

  type FullProfile = Profile.FullProfile;
  type UserProfile = Profile.UserProfile;
  type KycInfo = Profile.KycInfo;
  type Wallet = Wallets.Wallet;
  type Dispute = DisputeManagement.Dispute;
  type AuditTrail = Auditing.AuditTrail;
  type Order = Orders.Order;
  type PaymentDetails = Orders.PaymentDetails;
  type EscrowRelease = Orders.EscrowRelease;

  let profiles = Map.empty<Principal, FullProfile>();
  let wallets = Map.empty<Principal, Wallet>();
  let disputes = Map.empty<Principal, [Dispute]>();
  let auditTrails = Map.empty<Principal, [AuditTrail]>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let orders = Map.empty<Nat, Order>();
  let escrowReleases = Map.empty<Nat, EscrowRelease>();
  var nextOrderId = 1;

  // ─── Frontend profile functions (Delegated to auth component) ──────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get their profiles");
    };
    userProfiles.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save their profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ─── KYC/Account Functions ────────────────────────────────────────────────

  public query ({ caller }) func getProfile(user : Principal) : async FullProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updateKyc() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update their KYC");
    };

    let existingProfile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let updatedProfile : FullProfile = {
      username = existingProfile.username;
      email = existingProfile.email;
      kycInfo = {
        kycLevel = 0;
        verified = false;
      };
    };
    profiles.add(caller, updatedProfile);
  };

  public shared ({ caller }) func adminSetKycVerified(user : Principal, verified : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can approve or reject KYC");
    };

    let existingProfile = switch (profiles.get(user)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let updatedProfile : FullProfile = {
      username = existingProfile.username;
      email = existingProfile.email;
      kycInfo = {
        kycLevel = 0;
        verified;
      };
    };
    profiles.add(user, updatedProfile);
  };

  // ─── Sell Order & Escrow Logic ────────────────────────────────────────────

  public shared ({ caller }) func createSellOrder(amountUsdt : Float, exchangeRate : Float, paymentDetails : PaymentDetails) : async Nat {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can create orders");
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let newOrder : Order = {
      orderId;
      seller = caller;
      amountUsdt;
      exchangeRate;
      paymentDetails;
    };

    orders.add(orderId, newOrder);
    orderId;
  };

  public shared ({ caller }) func confirmInrPayment(orderId : Nat, buyer : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can confirm INR payment");
    };

    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };

    let profitSpread = order.amountUsdt * 0.015; // 1.5% spread
    let netUsdt = order.amountUsdt - profitSpread;

    let buyerWallet = switch (wallets.get(buyer)) {
      case (null) { Wallets.empty() };
      case (?wallet) { wallet };
    };

    let updatedBuyerWallet = {
      userBalance = buyerWallet.userBalance + netUsdt;
      escrowBalance = buyerWallet.escrowBalance;
      profitWallet = buyerWallet.profitWallet;
    };
    wallets.add(buyer, updatedBuyerWallet);

    let platformWallet = switch (wallets.get(caller)) {
      case (null) { Wallets.empty() };
      case (?wallet) { wallet };
    };

    let updatedPlatformWallet = {
      userBalance = platformWallet.userBalance;
      escrowBalance = platformWallet.escrowBalance;
      profitWallet = platformWallet.profitWallet + profitSpread;
    };
    wallets.add(caller, updatedPlatformWallet);

    let escrowRelease : EscrowRelease = {
      orderId;
      buyer;
      usdtReleased = netUsdt;
      profitAmount = profitSpread;
      timestamp = 0; // Placeholder for actual timestamp retrieval
    };
    escrowReleases.add(orderId, escrowRelease);
  };

  // ─── Wallet Functions ─────────────────────────────────────────────────────

  public query ({ caller }) func getWallet(user : Principal) : async Wallet {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own wallet");
    };

    switch (wallets.get(user)) {
      case (null) { Runtime.trap("Wallet not found") };
      case (?wallet) { wallet };
    };
  };

  public shared ({ caller }) func deposit(_amount : Float) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can deposit");
    };
    Runtime.trap("Deposit route not implemented yet");
  };

  public shared ({ caller }) func withdraw(_amount : Float) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can withdraw");
    };
    Runtime.trap("Withdraw route not implemented yet");
  };

  public shared ({ caller }) func approveWithdrawal(_user : Principal, _amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins or finance role can approve withdrawals");
    };
    Runtime.trap("Approve withdrawal not implemented yet");
  };

  // ─── Dispute Functions ────────────────────────────────────────────────────

  public shared ({ caller }) func raiseDispute(_orderId : Nat, _disputeType : DisputeManagement.DisputeType) : async () {
    if (not (UserApproval.isApproved(approvalState, caller) or AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only approved users can raise disputes");
    };
    Debug.print("Disputes are not implemented yet");
  };

  public shared ({ caller }) func freezeOrder(_orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can freeze orders");
    };
    Debug.print("Freeze order not implemented yet");
  };

  public shared ({ caller }) func freezeWallet(_user : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can freeze wallets");
    };
    Debug.print("Freeze wallet not implemented yet");
  };

  public shared ({ caller }) func manualReleaseUsdt(_user : Principal, _amount : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can manually release USDT");
    };
    Debug.print("Manual USDT release not implemented yet");
  };

  public shared ({ caller }) func issueRefund(_orderId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can issue refunds");
    };
    Debug.print("Issue refund not implemented yet");
  };

  // ─── Audit Trail Functions ────────────────────────────────────────────────

  public shared ({ caller }) func recordAuditTrail(_actionType : Auditing.ActionType, _timestamp : Int) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can record audit trails");
    };
    Debug.print("Audit trail does not record anything yet");
  };

  public query ({ caller }) func getAuditTrails(_user : Principal) : async [AuditTrail] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view audit trails");
    };
    switch (auditTrails.get(_user)) {
      case (null) { [] };
      case (?trails) { trails };
    };
  };

  // ─── Admin Profit Dashboard ───────────────────────────────────────────────

  public query ({ caller }) func getProfitDashboard() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins or finance role can view the profit dashboard");
    };
    "Profit dashboard not implemented yet";
  };

  public query ({ caller }) func exportCsv() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins or finance role can export to csv");
    };
    "CSV export not implemented yet";
  };

  // ─── Platform-wide Controls ───────────────────────────────────────────────

  public shared ({ caller }) func toggleWithdrawalLock(_locked : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle the withdrawal lock");
    };
    Debug.print("Withdrawal lock toggle not implemented yet");
  };

  public shared ({ caller }) func setPlatformRate(_rate : Float) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set the platform rate");
    };
    Debug.print("Platform rate setting not implemented yet");
  };

  // ─── Approval Management Functions (from Errors) ──────────────────────────

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

  // ─── KYC & Approval Status Queries ────────────────────────────────────────

  public query ({ caller }) func checkKycStatus() : async Nat8 {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can check their KYC status");
    };
    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };
    0;
  };

  public query ({ caller }) func checkApprovalStatus() : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user)) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only users or admins can check approval status");
    };
    UserApproval.isApproved(approvalState, caller);
  };
};
