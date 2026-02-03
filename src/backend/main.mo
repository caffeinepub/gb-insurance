import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  public type InsuranceType = {
    #life;
    #health;
    #vehicle;
    #property;
    #travel;
    #personalAccident;
  };

  public type CustomerForm = {
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

  public type UserProfile = {
    name : Text;
    email : Text;
    role : Text;
  };

  public type VisitorAnalytics = {
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
  let userProfiles = Map.empty<Principal, UserProfile>();
  let visitorIdentifiers = Map.empty<Principal, Bool>();
  var visitorStats : VisitorAnalytics = {
    totalVisitors = 0;
    uniqueVisitors = 0;
    pageViews = 0;
    submissions = 0;
  };

  // PUBLIC: Form Submission - No authentication required for customer inquiries
  public func submitForm(
    name : Text,
    phone : Text,
    email : Text,
    address : Text,
    interests : [InsuranceType],
    feedback : Text,
    documents : [Storage.ExternalBlob],
  ) : async () {
    // Validate required fields
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
    visitorStats := {
      visitorStats with
      submissions = visitorStats.submissions + 1;
    };
  };

  // PUBLIC: Visitor tracking - No authentication required
  public shared ({ caller }) func recordVisitor() : async () {
    // Track unique visitors (including anonymous)
    if (visitorIdentifiers.get(caller) == null) {
      visitorIdentifiers.add(caller, true);
      visitorStats := {
        visitorStats with
        uniqueVisitors = visitorStats.uniqueVisitors + 1;
      };
    };

    // Increment page views
    visitorStats := {
      visitorStats with
      pageViews = visitorStats.pageViews + 1;
      totalVisitors = visitorStats.totalVisitors + 1;
    };
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

  // USER: Get caller's own profile
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can access profiles");
    };
    userProfiles.get(caller);
  };

  // USER OR ADMIN: Get user profile (users can view own, admins can view any)
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    // Allow if caller is viewing their own profile OR caller is an admin
    let isViewingOwnProfile = (caller == user);
    let isCallerAdmin = AccessControl.isAdmin(accessControlState, caller);
    
    if (not isViewingOwnProfile and not isCallerAdmin) {
      Runtime.trap("Unauthorized: Can only view your own profile unless you are an admin");
    };
    
    // Ensure caller is at least a user (not a guest)
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
    
    // Basic email validation
    if (not containsAt(profile.email)) {
      Runtime.trap("Invalid email format");
    };
    
    userProfiles.add(caller, profile);
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
};
