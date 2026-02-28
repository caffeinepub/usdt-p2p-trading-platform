import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserApprovalInfo {
    status: ApprovalStatus;
    principal: Principal;
}
export interface Wallet {
    escrowBalance: number;
    profitWallet: number;
    userBalance: number;
}
export interface AuditTrail {
    actionType: ActionType;
    timestamp: bigint;
}
export interface PaymentDetails {
    bankAccountNumber: string;
    ifscCode: string;
    upiId: string;
}
export interface FullProfile {
    username: string;
    email: string;
    kycInfo: KycInfo;
}
export interface UserProfile {
    username: string;
    email: string;
}
export interface KycInfo {
    verified: boolean;
    kycLevel: number;
}
export enum ActionType {
    deposit = "deposit",
    orderPlacement = "orderPlacement",
    withdrawal = "withdrawal",
    orderCompletion = "orderCompletion",
    disputeRaised = "disputeRaised"
}
export enum ApprovalStatus {
    pending = "pending",
    approved = "approved",
    rejected = "rejected"
}
export enum DisputeType {
    buyerDispute = "buyerDispute",
    sellerDispute = "sellerDispute"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    adminSetKycVerified(user: Principal, verified: boolean): Promise<void>;
    approveWithdrawal(_user: Principal, _amount: number): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkApprovalStatus(): Promise<boolean>;
    checkKycStatus(): Promise<number>;
    confirmInrPayment(orderId: bigint, buyer: Principal): Promise<void>;
    createSellOrder(amountUsdt: number, exchangeRate: number, paymentDetails: PaymentDetails): Promise<bigint>;
    deposit(_amount: number): Promise<void>;
    exportCsv(): Promise<string>;
    freezeOrder(_orderId: bigint): Promise<void>;
    freezeWallet(_user: Principal): Promise<void>;
    getAuditTrails(_user: Principal): Promise<Array<AuditTrail>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProfile(user: Principal): Promise<FullProfile>;
    getProfitDashboard(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWallet(user: Principal): Promise<Wallet>;
    isCallerAdmin(): Promise<boolean>;
    isCallerApproved(): Promise<boolean>;
    issueRefund(_orderId: bigint): Promise<void>;
    listApprovals(): Promise<Array<UserApprovalInfo>>;
    manualReleaseUsdt(_user: Principal, _amount: number): Promise<void>;
    raiseDispute(_orderId: bigint, _disputeType: DisputeType): Promise<void>;
    recordAuditTrail(_actionType: ActionType, _timestamp: bigint): Promise<void>;
    requestApproval(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setApproval(user: Principal, status: ApprovalStatus): Promise<void>;
    setPlatformRate(_rate: number): Promise<void>;
    toggleWithdrawalLock(_locked: boolean): Promise<void>;
    updateKyc(): Promise<void>;
    withdraw(_amount: number): Promise<void>;
}
