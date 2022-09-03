import Image from "next/image";
import Link from "next/link";
import { getPPUrl } from "@utils/getPPUrl";

export default function ProfilePreview({
  profile,
  setIsOpen,
  clearInput,
  fromComponent,
}: {
  profile: any;
  setIsOpen?: (open: boolean) => void;
  clearInput?: () => void;
  fromComponent: string;
}) {
  const handleOnClick = () => {

    setIsOpen && setIsOpen(false);
    clearInput && clearInput();
    
  };
  return (
    <Link href={`/profile/${profile?.id ? profile.id : profile?.profileId}`}>
      <a onClick={handleOnClick}>
        <div
          className={`  ${
            fromComponent === "search" ? "px-4 py-2 hover:bg-gray-100" : 'pb-4'
          }`}
        >
          <div className="flex justify-between items-center ">
            <div className="flex items-center space-x-3">
              <Image
                src={getPPUrl(profile)}
                loading="lazy"
                className="w-10 h-10 bg-gray-100 rounded-full border"
                height={40}
                width={40}
                alt={profile.name}
              />
              <div>
                <div className="flex gap-1 items-center max-w-sm truncate">
                  <div className="text-md">
                    {profile.name ?? profile.handle}
                  </div>
                </div>
                <span className="text-emerald-600 text-xs">
                  @{profile.handle}
                </span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
