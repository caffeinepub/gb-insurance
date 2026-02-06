import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface VisitorAnalytics {
    totalVisitors: bigint;
    submissions: bigint;
    pageViews: bigint;
    uniqueVisitors: bigint;
}
export type Time = bigint;
export interface CustomerForm {
    id: bigint;
    uploadedDocuments: Array<ExternalBlob>;
    name: string;
    insuranceInterests: Array<InsuranceType>;
    feedback: string;
    email: string;
    address: string;
    timestamp: Time;
    phone: string;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export enum InsuranceType {
    travel = "travel",
    life = "life",
    personalAccident = "personalAccident",
    property = "property",
    vehicle = "vehicle",
    health = "health"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllForms(): Promise<Array<CustomerForm>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFormById(id: bigint): Promise<CustomerForm | null>;
    getFormsByInsuranceType(insuranceType: InsuranceType): Promise<Array<CustomerForm>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorCount(): Promise<bigint>;
    getVisitorStats(): Promise<VisitorAnalytics>;
    isCallerAdmin(): Promise<boolean>;
    recordVisitor(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitForm(name: string, phone: string, email: string, address: string, interests: Array<InsuranceType>, feedback: string, documents: Array<ExternalBlob>): Promise<void>;
}
