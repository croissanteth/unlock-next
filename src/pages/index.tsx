import type { NextPage } from "next";
import Link from "next/link";
import {} from "swr";
import { useUser } from "~/hooks/useUser";
const Home: NextPage = () => {
  const { user, mutateUser } = useUser();
  return (
    <div
      style={{
        display: "grid",
        margin: "auto",
        alignItems: "center",
        minHeight: "100vh",
        justifyItems: "center",
      }}
    >
      {user?.walletAddress ? (
        <div>
          <p> Hello {user.walletAddress}, thanks for being our member. </p>
          <button
            onClick={async () => {
              const result = await fetch("/api/logout", {
                method: "POST",
              });
              mutateUser();
            }}
          >
            logout
          </button>
        </div>
      ) : (
        <Link href="/api/login">
          <a
            style={{
              backgroundColor: "black",
              color: "white",
              padding: "10px 20px",
              borderRadius: "6px",
            }}
          >
            Click here to verify or buy your NFT membership to access this page.
          </a>
        </Link>
      )}
    </div>
  );
};

export default Home;
