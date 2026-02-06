import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  type InsuranceType = {
    #life;
    #health;
    #vehicle;
    #property;
    #travel;
    #personalAccident;
  };

  type CustomerForm = {
    id : Nat;
    name : Text;
    phone : Text;
    email : Text;
    address : Text;
    insuranceInterests : [InsuranceType];
    feedback : Text;
    timestamp : Time.Time;
    uploadedDocuments : [Storage.ExternalBlob];
  };

  type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type VisitorAnalytics = {
    totalVisitors : Nat;
    uniqueVisitors : Nat;
    pageViews : Nat;
    submissions : Nat;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  let customerForms = Map.empty<Nat, CustomerForm>();
  var nextId = 0;
  var submissionsCount = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let visitorIdentifiers = Map.empty<Principal, Bool>();

  var visitorStats : VisitorAnalytics = {
    totalVisitors = 0;
    uniqueVisitors = 0;
    pageViews = 0;
    submissions = 0;
  };

  var adminPassword = "default_admin_password";
  var failedAdminLoginAttempts = 0;
  let failedLoginThreshold = 3;

  // ADMIN: Login with Password
  public shared ({ caller }) func adminLoginWithPassword(password : Text) : async Bool {
    if (failedAdminLoginAttempts >= failedLoginThreshold) {
      Runtime.trap("Too many failed login attempts. Please use the recovery process.");
    };

    if (Text.equal(password, adminPassword)) {
      failedAdminLoginAttempts := 0;
      // Grant admin role to the caller after successful authentication
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      true;
    } else {
      failedAdminLoginAttempts += 1;
      false;
    };
  };

  // ADMIN: Reset Admin Password
  public shared ({ caller }) func resetAdminPassword(resetCode : Text, newPassword : Text) : async Bool {
    // Explicitly reject anonymous callers for security and consistency across environments
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous callers cannot reset admin password");
    };

    // Validate input parameters
    if (resetCode.size() == 0) {
      Runtime.trap("Invalid input: Reset code cannot be empty");
    };

    if (newPassword.size() < 8) {
      Runtime.trap("Invalid input: Password must be at least 8 characters long");
    };

    // Check if caller is already an admin OR has the valid reset code
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let hasValidResetCode = Text.equal(resetCode, "GB.INSURE.JAI.P.");

    if (not isAdmin and not hasValidResetCode) {
      Runtime.trap("Unauthorized: Invalid reset code");
    };

    // Update password and reset failed login attempts
    adminPassword := newPassword;
    failedAdminLoginAttempts := 0;

    // Grant admin role to the caller if they used the reset code
    if (not isAdmin and hasValidResetCode) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
    };

    true;
  };

  // PUBLIC: Form Submission - No authentication required for customer inquiries
  public shared ({ caller }) func submitForm(
    name : Text,
    phone : Text,
    email : Text,
    address : Text,
    interests : [InsuranceType],
    feedback : Text,
    documents : [Storage.ExternalBlob],
  ) : async () {
    if (name == "" or phone == "" or email == "") {
      Runtime.trap("Name, phone, and email are required");
    };

    // Validate at least one insurance interest is selected
    if (interests.size() == 0) {
      Runtime.trap("At least one insurance interest must be selected");
    };

    let form : CustomerForm = {
      id = nextId;
      name;
      phone;
      email;
      address;
      insuranceInterests = interests;
      feedback;
      timestamp = Time.now();
      uploadedDocuments = documents;
    };

    customerForms.add(nextId, form);
    nextId += 1;
    submissionsCount += 1;
    updateVisitorStats(submissionsCount);
  };

  // PUBLIC: Visitor tracking - No authentication required
  public shared ({ caller }) func recordVisitor() : async () {
    // Track unique visitors (including anonymous)
    if (visitorIdentifiers.get(caller) == null) {
      visitorIdentifiers.add(caller, true);
      updateVisitorStats(visitorStats.submissions);
    };

    // Increment page views
    updateVisitorStats(visitorStats.submissions);
  };

  // PUBLIC: Get visitor count - No authentication required for display
  public query func getVisitorCount() : async Nat {
    visitorStats.uniqueVisitors;
  };

  // ADMIN ONLY: Query all customer forms
  public query ({ caller }) func getAllForms() : async [CustomerForm] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all customer forms");
    };
    customerForms.values().toArray();
  };

  // ADMIN ONLY: Get detailed visitor statistics
  public query ({ caller }) func getVisitorStats() : async VisitorAnalytics {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view visitor statistics");
    };
    visitorStats;
  };

  // ADMIN ONLY: Get form by ID
  public query ({ caller }) func getFormById(id : Nat) : async ?CustomerForm {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view customer forms");
    };
    customerForms.get(id);
  };

  // ADMIN ONLY: Query all customer forms by insurance type
  public query ({ caller }) func getFormsByInsuranceType(insuranceType : InsuranceType) : async [CustomerForm] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can query by insurance interest");
    };

    let filteredForms = customerForms.values().toArray().filter(
      func(form) {
        form.insuranceInterests.any(
          func(insType) { insType == insuranceType }
        );
      }
    );

    filteredForms;
  };

  // USER: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  // USER OR ADMIN: Get user profile (users can view own, admins can view any)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    let isViewingOwnProfile = (caller == user);
    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not isViewingOwnProfile and not isCallerAdmin) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };

    if (not isCallerAdmin and not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };

    userProfiles.get(user);
  };

  // USER: Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };

    // Validate profile data
    if (profile.name == "" or profile.email == "") {
      Runtime.trap("Name and email are required for profile");
    };

    if (not containsAt(profile.email)) {
      Runtime.trap("Invalid email format");
    };

    userProfiles.add(caller, profile);
  };

  // HEALTH CHECK: Anonymous backend status check
  public query ({ caller }) func healthCheck() : async Bool {
    true;
  };

  // Helper function for basic email validation
  func containsAt(text : Text) : Bool {
    for (char in text.chars()) {
      if (char == '@') {
        return true;
      };
    };
    false;
  };

  // Helper function to update visitor statistics
  func updateVisitorStats(submissions : Nat) {
    let uniqueVisitorCount = visitorIdentifiers.toArray().size();
    let totalVisitors = nextId; // Using nextId as total visitors count for simplicity

    let newStats = {
      totalVisitors;
      uniqueVisitors = uniqueVisitorCount;
      pageViews = uniqueVisitorCount;
      submissions;
    };
    visitorStats := newStats;
  };
};
