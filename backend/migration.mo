import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type LegacyKycInfo = {
    kycLevel : Nat8;
    panNumber : ?Text;
    aadhaarNumber : ?Text;
    kycVerified : Bool;
  };

  type LegacyFullProfile = {
    username : Text;
    email : Text;
    kycInfo : LegacyKycInfo;
  };

  type LegacyActor = {
    profiles : Map.Map<Principal, LegacyFullProfile>;
  };

  type KycInfo = {
    kycLevel : Nat8;
    verified : Bool;
  };

  type FullProfile = {
    username : Text;
    email : Text;
    kycInfo : KycInfo;
  };

  type CurrentActor = {
    profiles : Map.Map<Principal, FullProfile>;
  };

  public func run({ profiles = legacyProfiles } : LegacyActor) : CurrentActor {
    let currentProfiles = legacyProfiles.map<Principal, LegacyFullProfile, FullProfile>(
      func(_principal, legacyProfile) {
        let currentKycInfo : KycInfo = {
          kycLevel = legacyProfile.kycInfo.kycLevel;
          verified = legacyProfile.kycInfo.kycVerified;
        };
        {
          username = legacyProfile.username;
          email = legacyProfile.email;
          kycInfo = currentKycInfo;
        };
      }
    );
    { profiles = currentProfiles };
  };
};
