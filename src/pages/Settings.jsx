import ReviewerSection from "../components/settings/ReviewerSection";
import PlatformSection from "../components/settings/PlatformSection";
import UserIdSection from "../components/settings/UserIdSection";

const Settings = () => {
  return (
    <div className="p-4 md:p-8">
      <UserIdSection />
      <ReviewerSection />
      <PlatformSection />
    </div>
  );
};

export default Settings;
