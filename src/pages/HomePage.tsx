import { CreateArtist } from "@/components/modals/CreateArtist";
import { RecentPlayedList } from "@/components/RecentPlayed/RecentPlayedList";
import { useRecent } from "@/graphql/queries/useRecent";

export const HomePage = () => {
  const { recentItems, isLoading } = useRecent();

  console.log(recentItems);

  return (
    <div>
      <h1 className="text-4xl font-bold">Welcome Back!</h1>
      {isLoading ? <div>Loading...</div> : <RecentPlayedList recentItems={recentItems} />}
      <CreateArtist />
    </div>
  );
};
