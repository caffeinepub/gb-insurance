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
export interface AppSettings {
    officeHours: string;
    maintenanceMode: boolean;
    contactEmail: string;
}
export type Time = bigint;
export interface ServiceInfo {
    title: string;
    icon?: ExternalBlob;
    description: string;
}
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
export interface SiteContent {
    homeTitle: string;
    heroText: string;
    heroImage?: ExternalBlob;
    generalInfo: string;
    testimonials: Array<Testimonial>;
    homeDescription: string;
    services: Array<ServiceInfo>;
}
export interface UserProfile {
    name: string;
    role: string;
    email: string;
}
export interface Testimonial {
    serviceUsed: string;
    clientName: string;
    feedback: string;
    rating: bigint;
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
    adminLoginWithPassword(password: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllForms(): Promise<Array<CustomerForm>>;
    getAppSettings(): Promise<AppSettings>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFormById(id: bigint): Promise<CustomerForm | null>;
    getFormsByInsuranceType(insuranceType: InsuranceType): Promise<Array<CustomerForm>>;
    getSiteContent(): Promise<SiteContent>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorCount(): Promise<bigint>;
    isCallerAdmin(): Promise<boolean>;
    listAllUserProfiles(): Promise<Array<[Principal, UserProfile]>>;
    recordVisitor(): Promise<void>;
    resetAdminPassword(resetCode: string, newPassword: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitForm(name: string, phone: string, email: string, address: string, interests: Array<InsuranceType>, feedback: string, documents: Array<ExternalBlob>): Promise<void>;
    updateAppSettings(newSettings: AppSettings): Promise<void>;
    updateSiteContent(newContent: SiteContent): Promise<void>;
    updateUserProfile(user: Principal, profile: UserProfile): Promise<void>;
}
