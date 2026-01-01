import { RecentPlayedList } from "@/components/RecentPlayed/RecentPlayedList";
import { useRecent } from "@/graphql/queries/useRecent";

export const HomePage = () => {
  const { recentItems, isLoading } = useRecent();

  console.log(recentItems);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome Back!</h1>
      {isLoading ? <div>Loading...</div> : <RecentPlayedList recentItems={recentItems} />}
    </div>
  );
};
