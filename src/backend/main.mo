import Map "mo:core/Map";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
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

  type SiteContent = {
    homeTitle : Text;
    homeDescription : Text;
    heroText : Text;
    heroImage : ?Storage.ExternalBlob;
    generalInfo : Text;
    services : [ServiceInfo];
    testimonials : [Testimonial];
  };

  type ServiceInfo = {
    title : Text;
    description : Text;
    icon : ?Storage.ExternalBlob;
  };

  type Testimonial = {
    clientName : Text;
    feedback : Text;
    serviceUsed : Text;
    rating : Nat;
  };

  type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  type AppSettings = {
    maintenanceMode : Bool;
    contactEmail : Text;
    officeHours : Text;
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

  var siteContent : SiteContent = {
    homeTitle = "Welcome to IA MDR Insurance Agency";
    homeDescription = "Personalized insurance solutions for individuals and businesses.";
    heroText = "Your peace of mind is our priority.";
    heroImage = null;
    generalInfo = "We offer a wide range of insurance policies tailored to your needs.";
    services = [];
    testimonials = [];
  };

  var appSettings : AppSettings = {
    maintenanceMode = false;
    contactEmail = "info@iapl.com";
    officeHours = "9 AM - 5 PM, Monday to Friday";
  };

  // ADMIN: Login with Password
  public shared ({ caller }) func adminLoginWithPassword(password : Text) : async Bool {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous principals cannot login as admin");
    };

    if (failedAdminLoginAttempts >= failedLoginThreshold) {
      Runtime.trap("Too many failed login attempts. Please use the recovery process.");
    };

    if (Text.equal(password, adminPassword)) {
      failedAdminLoginAttempts := 0;
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      true;
    } else {
      failedAdminLoginAttempts += 1;
      false;
    };
  };

  // ADMIN: Reset Admin Password
  public shared ({ caller }) func resetAdminPassword(resetCode : Text, newPassword : Text) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only existing admins can reset the admin password");
    };

    if (resetCode.size() == 0) {
      Runtime.trap("Invalid input: Reset code cannot be empty");
    };

    if (newPassword.size() < 8) {
      Runtime.trap("Invalid input: Password must be at least 8 characters long");
    };

    let hasValidResetCode = Text.equal(resetCode, "GB.INSURE.JAI.P.");

    if (not hasValidResetCode) {
      Runtime.trap("Unauthorized: Invalid reset code");
    };

    adminPassword := newPassword;
    failedAdminLoginAttempts := 0;

    true;
  };

  // USER PROFILE: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  // USER PROFILE: Save caller's own profile
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // USER PROFILE: Get any user's profile (own or admin viewing others)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.notEqual(user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // ADMIN ONLY: List all user profiles
  public query ({ caller }) func listAllUserProfiles() : async [(Principal, UserProfile)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list all user profiles");
    };
    userProfiles.toArray();
  };

  // ADMIN ONLY: Update user profile (admin-controlled fields)
  public shared ({ caller }) func updateUserProfile(user : Principal, profile : UserProfile) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update user profiles");
    };
    userProfiles.add(user, profile);
  };

  // PUBLIC: Form Submission
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

    if (interests.size() == 0) {
      Runtime.trap("At least one insurance interest must be selected");
    };

    let form : CustomerForm = {
      id = customerForms.size();
      name;
      phone;
      email;
      address;
      insuranceInterests = interests;
      feedback;
      timestamp = Time.now();
      uploadedDocuments = documents;
    };

    customerForms.add(customerForms.size(), form);
    submissionsCount += 1;
  };

  // PUBLIC: Visitor tracking
  public shared ({ caller }) func recordVisitor() : async () {
    if (visitorIdentifiers.get(caller) == null) {
      visitorIdentifiers.add(caller, true);
    };
  };

  // PUBLIC: Get visitor count
  public query ({ caller }) func getVisitorCount() : async Nat {
    let totalVisitors = visitorIdentifiers.size();
    totalVisitors;
  };

  // PUBLIC: Get site content
  public query ({ caller }) func getSiteContent() : async SiteContent {
    siteContent;
  };

  // PUBLIC: Get app settings
  public query ({ caller }) func getAppSettings() : async AppSettings {
    appSettings;
  };

  // ADMIN ONLY: Update site content
  public shared ({ caller }) func updateSiteContent(newContent : SiteContent) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update site content");
    };

    siteContent := newContent;
  };

  // ADMIN ONLY: Update app settings
  public shared ({ caller }) func updateAppSettings(newSettings : AppSettings) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update app settings");
    };

    appSettings := newSettings;
  };

  // ADMIN ONLY: Query all customer forms
  public query ({ caller }) func getAllForms() : async [CustomerForm] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all customer forms");
    };
    customerForms.values().toArray();
  };

  // ADMIN ONLY: Get form by ID
  public query ({ caller }) func getFormById(id : Nat) : async ?CustomerForm {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view customer forms");
    };
    customerForms.get(id);
  };

  // ADMIN ONLY: Get forms by insurance type
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
};
