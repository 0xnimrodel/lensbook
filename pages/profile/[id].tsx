import { useRouter } from "next/router";
import Layout from "@components/Layout";
import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  // client,
  getProfileById,
  getPublicationsById,
  CONTRACT_ADDRESS,
  client,
} from "../../api";
import { getPPUrl } from "@utils/getPPUrl";
import { ethers } from "ethers";
import ABI from "../../abi.json";
import { useGlobalContext } from "@hooks/useGlobalContext";
import moment from "moment";
import ProfilePreview from "@components/ProfilePreview";
import ConnectBtn from "@components/ConnectBtn";

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;

  const [profile, setProfile] = useState<any>();
  const [pubs, setPubs] = useState([]);
  const [waiting, setWaiting] = useState(false);
  const [following, setFollowing] = useState(false);
  const [isFollowingHover, setIsFollowingHover] = useState(false);

  const { address, library } = useGlobalContext();

  useEffect(() => {
    if (id) {
      fetchProfile();
    }
  }, [id]);

  useEffect(() => {
    console.log(isFollowingHover);
  }, [isFollowingHover]);

  console.log("[id].ts address", address);

  async function followUser() {
    const signer = library.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    try {
      const tx = await contract.follow([id], [0x0]);
      setWaiting(true);
      await tx.wait();
      setWaiting(false);
      setFollowing(true);
      console.log("Followed user successfully");
    } catch (err) {
      console.log("Failed to follow user due to", err);
    }
  }

  async function unfollowUser() {}

  async function fetchProfile() {
    try {
      const response = await client.query(getProfileById, { id }).toPromise();
      console.log("PROFILE:", response);
      setProfile(response.data.profile);

      const publications = await client
        .query(getPublicationsById, { id })
        .toPromise();
      console.log("PUBS!", publications);
      setPubs(publications.data.publications.items);
    } catch (error) {
      console.log("ERROR:", error);
    }
  }

  return (
    <Layout>
      <Head>
        <title>{profile ? profile.handle : "Lensbook"}</title>
      </Head>
      <div className="my-12">
        {profile && (
          <div className="flex flex-wrap md:flex-nowrap items-start w-full">
            <div className="w-full md:w-auto mb-4 md:mr-8">
              <div className="relative w-60 h-60">
                <Image
                  src={getPPUrl(profile)}
                  layout="fill"
                  objectFit="cover"
                  alt={profile.handle}
                  className="rounded-full"
                />
              </div>
            </div>
            <div className="grow-1 w-full">
              <div className="text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl sm:tracking-tight mb-1">
                  {profile.name}
                </h1>
                <h2 className="text-xl font-bold text-emerald-500 sm:text-2xl sm:tracking-tight mb-2">
                  {profile.handle}
                </h2>
                <div className="flex flex-wrap gap-x-2 text-gray-600 text-sm sm:text-base mb-4 justify-center md:justify-start">
                  <p>
                    <span className="text-gray-900 font-medium">
                      {profile.stats.totalFollowers}
                    </span>{" "}
                    Followers
                  </p>
                  <p>
                    <span className="text-gray-900 font-medium">
                      {profile.stats.totalFollowing}
                    </span>{" "}
                    Following
                  </p>
                </div>
                <p className="mb-4">{profile.bio}</p>
                {address ? (
                  <>
                    {waiting ? (
                      <button
                        onClick={followUser}
                        type="button"
                        className="flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                        disabled
                      >
                        <div role="status">
                          <svg
                            className="inline mr-2 w-4 h-4 text-white animate-spin  fill-emerald-500 da"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="currentColor"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentFill"
                            />
                          </svg>
                          <span className="sr-only">Loading...</span>
                        </div>
                        Following
                      </button>
                    ) : profile.isFollowedByMe || following ? (
                      <button
                        onMouseEnter={() => setIsFollowingHover(true)}
                        onMouseLeave={() => setIsFollowingHover(false)}
                        onClick={isFollowingHover ? unfollowUser : followUser}
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600"
                        disabled
                      >
                        {isFollowingHover ? "✕ Unfollow" : "✓ Following"}
                      </button>
                    ) : (
                      <button
                        onClick={followUser}
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                      >
                        Follow
                      </button>
                    )}
                  </>
                ) : (
                  <ConnectBtn />
                )}
              </div>
              {pubs.length > 0 && (
                <div className="border-t-2 max-w-3xl border-b-2 my-8 flex flex-col rounded">
                  {pubs.map(
                    (p: any, index: number) =>
                      p.__typename === "Post" && (
                        <div
                          key={index}
                          className={`py-5 px-4 ${index != 0 && "border-t-2"}`}
                        >
                          <div className="flex w-full justify-between items-start">
                            <ProfilePreview
                              profile={profile}
                              fromComponent=""
                            />
                            <p className="text-xs opacity-80">
                              {moment(p?.createdAt).format("lll")}
                            </p>
                          </div>
                          <div style={{ paddingLeft: "52px" }}>
                            <p>{p.metadata.name}</p>
                            <p>{p.metadata.content}</p>
                            <div className="flex w-80 justify-between text-sm pt-6">
                              <p className="flex gap-2 items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-message-square"
                                >
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                                </svg>
                                {p.stats?.totalAmountOfComments > 0 &&
                                  p.stats?.totalAmountOfComments}
                              </p>

                              <p className="flex gap-2 items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-repeat"
                                >
                                  <polyline points="17 1 21 5 17 9"></polyline>
                                  <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                                  <polyline points="7 23 3 19 7 15"></polyline>
                                  <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                                </svg>
                                {p.stats?.totalAmountOfMirrors > 0 &&
                                  p.stats?.totalAmountOfMirrors}
                              </p>
                              <p className="flex gap-2 items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-heart"
                                >
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                </svg>
                                {p.stats?.totalUpvotes > 0 &&
                                  p.stats?.totalUpvotes}
                              </p>
                              <p className="flex gap-2 items-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  className="feather feather-bookmark"
                                >
                                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                {p.stats?.totalAmountOfCollects > 0 &&
                                  p.stats?.totalAmountOfCollects}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
