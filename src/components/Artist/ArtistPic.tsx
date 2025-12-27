import type { Maybe } from "@/graphql/types";
import { User } from "lucide-react";

type Props = {
    url: Maybe<string> | undefined
}

export const ArtistPic = ({ url }: Props) => {
    return <div className="w-48 h-48 rounded-full bg-stone-900 flex items-center justify-center">
        {url ? <img src={url} alt="" className="w-full h-full rounded-full" /> : <User className="w-full h-full text-stone-200" />}
    </div>
};