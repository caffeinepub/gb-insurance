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
export type Time = bigint;
export interface CustomerForm {
    id: bigint;
    name: string;
    email: string;
    address: string;
    timestamp: Time;
    phone: string;
    attachments?: ExternalBlob;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addAdmin(newAdmin: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getAllEncryptedPasswords(): Promise<Array<string>>;
    getAllForms(): Promise<Array<CustomerForm>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFormById(id: bigint): Promise<CustomerForm | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisitorCount(): Promise<bigint>;
    initializeAdmin(adminToken: string, userProvidedToken: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    listAdmins(): Promise<Array<Principal>>;
    removeAdmin(adminToRemove: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    submitForm(name: string, email: string, phone: string, address: string, attachments: ExternalBlob | null): Promise<void>;
}
