import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import TierABI from "@/artifacts/contracts/TierNFT.sol/TierNFT.json";
import { useEffect, useState } from "react";
import { parseEther } from "viem";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
export default function Home() {
  const { isConnected } = useAccount();

  const [isUserConnected, setIsUserConnected] = useState(false);
  const [latestNFTMinted, setLatestNFTMinted] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintingPrice, setMintingPrice] = useState("0");

  const { data: tokenData, refetch: refetchTokenData } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: TierABI.abi,
    functionName: "totalSupply",
    watch: true,
    enabled: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  });

  const { data: tokenURI } = useContractRead({
    address: CONTRACT_ADDRESS,
    abi: TierABI.abi,
    functionName: "tokenURI",
    args: [1],
    watch: true,
    enabled: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  });

  useEffect(() => {
    try {
      setIsUserConnected(isConnected);
    } catch (error) {
      console.log("Error connecting to user", error.message);
    }
  }, [isConnected]);

  useEffect(() => {
    try {
      if (tokenURI) {
        setLatestNFTMinted(
          JSON.parse(window.atob(tokenURI.substring(tokenURI.indexOf(",") + 1)))
        );
      }
    } catch (error) {
      console.log("Error fetching token URI", error.message);
    }
  }, [tokenData, tokenURI]);

  const { config, isLoading: isMintLoading } = usePrepareContractWrite({
    address: CONTRACT_ADDRESS,
    abi: TierABI.abi,
    functionName: "safeMint",
    value: parseEther(mintingPrice),
    enabled: Boolean(mintingPrice !== "0"),
  });

  const { data: mintData, write } = useContractWrite(config);

  const { isLoading: isWaitForMintLoading, isSuccess } = useWaitForTransaction({
    hash: mintData?.hash,
  });

  console.log({ isWaitForMintLoading, isSuccess });

  const mintToken = async (e) => {
    // TODO: we need to fix the value before the prepareContractWrite hook
    try {
      write();

      console.log("This is the mint data", mintData);
      refetchTokenData(); // <--------- this is the new line: here an exaplanation of the refetchTokenData() Function for i.e.
      setIsMinting(false); // TODO: highlight this new line too
    } catch (error) {
      console.log({ error });
      console.log("Error minting NFT", error.message);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header style={header}>
        <h1>TierNFTs</h1>
        <ConnectButton />
      </header>
      {isUserConnected ? (
        <main className={styles.main}>
          <div style={NFTFlex}>
            <div style={NFTCard}>
              Tier 0
              <Image
                src="/nfts/0_basic.svg"
                width="200"
                height="200"
                alt="Basic Tier"
              />
              <button
                value="0.01"
                onClick={(e) => {
                  setMintingPrice(e.target.value);

                  mintToken(e);
                }}
                style={NFTMint}
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
            <div style={NFTCard}>
              Tier 1
              <Image
                src="/nfts/1_medium.svg"
                width="200"
                height="200"
                alt="Medium Tier"
              />
              <button
                value="0.02"
                onClick={(e) => {
                  setMintingPrice(e.target.value);
                  mintToken(e);
                }}
                style={NFTMint}
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
            <div style={NFTCard}>
              Tier 2
              <Image
                src="/nfts/2_premium.svg"
                width="200"
                height="200"
                alt="Premium Tier"
              />
              <button
                value="0.05"
                onClick={(e) => {
                  setMintingPrice(e.target.value);
                  mintToken(e);
                }}
                style={NFTMint}
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
          </div>

          {modalShow && (
            <div style={modal}>
              {isMinting ? (
                <div style={modalContent}>
                  <h2>Minting...</h2>
                </div>
              ) : (
                <div style={modalContent}>
                  <h2>Mint Successful</h2>
                  <div style={modalBody}>
                    <h3>{latestNFTMinted.name}</h3>
                    <Image
                      src={latestNFTMinted.image}
                      height="200"
                      width="200"
                      alt="NFT Image" // px rem or em
                    />
                  </div>
                  <div style={modalFooter}>
                    <button style={modalButton}>
                      <a
                        href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${tokenData}`}
                        target="_blank"
                      >
                        View on OpenSea
                      </a>
                    </button>
                    <button style={modalButton}>
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${mintData.hash}`}
                        target="_blank"
                      >
                        View on Polygonscan
                      </a>
                    </button>
                    <button
                      onClick={() => setModalShow(false)}
                      style={modalButton}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      ) : (
        <main className={styles.main}>
          <div>Please connect your wallet.</div>
        </main>
      )}
    </div>
  );
}

const header = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  paddingTop: "20px",
  paddingLeft: "50px",
  paddingRight: "50px",
};

const NFTFlex = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-evenly",
  gap: "50px",
};

const NFTCard = {
  display: "flex",
  flexDirection: "column",
  border: "2px solid white",
  borderRadius: "10px",
  padding: "20px",
  alignItems: "center",
  gap: "10px",
  fontWeight: "bold",
};

const NFTMint = {
  fontWeight: "700",
  padding: "5px 20px",
  border: "2px solid white",
  color: "white",
  backgroundColor: "black",
  borderRadius: "5px",
  cursor: "pointer",
};

const modal = {
  position: "fixed",
  left: "0",
  top: "0",
  right: "0",
  bottom: "0",
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  zIndex: "1",
};

const modalContent = {
  backgroundColor: "#fff",
  padding: "10px 30px",
  borderRadius: "16px",
  color: "#000",
};

const modalBody = {
  padding: "20px",
  borderTop: "1px solid #eee",
  borderBottom: "1px solid #eee",
};

const modalFooter = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  padding: "20px",
  justifyContent: "space-evenly",
};

const modalButton = {
  padding: "10px 20px",
  backgroundColor: "#fff",
  color: "#666",
  border: "0",
  borderRadius: "10px",
  fontSize: "18px",
  fontWeight: "700",
  boxShadow:
    "0 0.2em 0.4em 0 rgba(0, 0, 0, 0.2), 0 0.3em 1em 0 rgba(0, 0, 0, 0.19)",
};
