import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  type CustomerForm = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    attachments : ?Storage.ExternalBlob;
    timestamp : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let customerForms = Map.empty<Nat, CustomerForm>();
  var lastId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Visitor tracking (dummy implementation)
  public query ({ caller = _ }) func getVisitorCount() : async Nat {
    0;
  };

  // Customer form functions - Admin-only access
  public query ({ caller }) func getAllForms() : async [CustomerForm] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all customer forms");
    };
    customerForms.values().toArray();
  };

  public query ({ caller }) func getFormById(id : Nat) : async ?CustomerForm {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view customer forms");
    };
    customerForms.get(id);
  };

  // New submission endpoint (as described)
  public shared ({ caller = _ }) func submitForm(
    name : Text,
    email : Text,
    phone : Text,
    address : Text,
    attachments : ?Storage.ExternalBlob,
  ) : async () {
    let form : CustomerForm = {
      id = lastId;
      name;
      email;
      phone;
      address;
      attachments;
      timestamp = Time.now();
    };

    customerForms.add(lastId, form);
    lastId += 1;
  };

  // Admin management functions
  // Ensure admin check before modifying roles
  public query ({ caller }) func getAllEncryptedPasswords() : async [Text] {
    Runtime.trap("Function not implemented. Only admins can perform this action");
  };

  // Init admin with explicit tokens.
  public shared ({ caller }) func initializeAdmin(adminToken : Text, userProvidedToken : Text) : async () {
    AccessControl.initialize(accessControlState, caller, adminToken, userProvidedToken);
  };

  // Add authorized admin to the system
  public shared ({ caller }) func addAdmin(newAdmin : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add other admins");
    };
    AccessControl.assignRole(accessControlState, caller, newAdmin, #admin);
  };

  // Remove an admin
  public shared ({ caller }) func removeAdmin(adminToRemove : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    if (caller == adminToRemove) {
      Runtime.trap("Cannot remove yourself as admin");
    };
    AccessControl.assignRole(accessControlState, caller, adminToRemove, #guest);
  };

  // Dummy implementation (pending module support)
  public query ({ caller }) func listAdmins() : async [Principal] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    [];
  };
};
