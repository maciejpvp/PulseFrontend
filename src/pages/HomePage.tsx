import { RecentPlayedList } from "@/components/RecentPlayed/RecentPlayedList";
import { useRecent } from "@/graphql/queries/useRecent";

export const HomePage = () => {
  const { recentItems, isLoading, isError } = useRecent();

  console.log(recentItems);

  return (
    <div>
      <h1 className="text-4xl font-bold">Welcome Back!</h1>

      <RecentPlayedList recentItems={recentItems} />
    </div>
  );
};
