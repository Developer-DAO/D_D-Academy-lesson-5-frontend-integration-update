import Head from "next/head";
import styles from "@/styles/Home.module.css";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useContractRead, useContractWrite } from "wagmi";
import TierABI from "@/artifacts/contracts/TierNFT.sol/TierNFT.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function Home() {
  const CONTRACT_ADDRESS = "";

  const { isConnected } = useAccount();

  const [isUserConnected, setIsUserConnected] = useState(false);
  const [latestNFTMinted, setLatestNFTMinted] = useState(0);
  const [modalShow, setModalShow] = useState(false);
  const [isMinting, setIsMinting] = useState(false);

  const {
    data: mintData,
    writeAsync: mint,
    isLoading: isMintLoading,
  } = useContractWrite({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: TierABI.abi,
    functionName: "mint",
  });

  const mintToken = async (e) => {
    try {
      setIsMinting(true);
      setModalShow(true);
      let mintTxn = await mint({
        recklesslySetUnpreparedOverrides: {
          value: ethers.utils.parseEther(e.target.value),
        },
      });
      await mintTxn.wait();
      console.log("This is the mint data", mintData);
      refetchTokenData();
      setIsMinting(false);
    } catch (error) {
      console.log("Error minting NFT", error.message);
    }
  };

  const { data: tokenData, refetch: refetchTokenData } = useContractRead({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: TierABI.abi,
    functionName: "totalSupply",
    watch: true,
  });

  const { data: tokenURI } = useContractRead({
    addressOrName: CONTRACT_ADDRESS,
    contractInterface: TierABI.abi,
    functionName: "tokenURI",
    args: tokenData,
    watch: true,
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

  return (
    <div className={styles.container}>
      <Head>
        <title>NFT Minter</title>
        <meta
          name="description"
          content="D_D Academy NFT Minter frontend integration project"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
              <h2> Tier 0</h2>
              <Image
                src="/nfts/0_basic.svg"
                width="200"
                height="200"
                alt="basic tier nft"
              />
              <button
                value="0.01"
                onClick={(e) => mintToken(e)}
                style={NFTMint}
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
            <div style={NFTCard}>
              <h2> Tier 1</h2>
              <Image
                src="/nfts/1_medium.svg"
                width="200"
                height="200"
                alt="medium tier nft"
              />
              <button
                value="0.02"
                onClick={(e) => mintToken(e)}
                style={NFTMint}
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
            <div style={NFTCard}>
              <h2>Tier 2</h2>
              <Image
                src="/nfts/2_premium.svg"
                width="200"
                height="200"
                alt="premium tier nft"
              />
              <button
                value="0.05"
                onClick={(e) => mintToken(e)}
                style={NFTMint}
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
          </div>
          {modalShow && (
            <div className="modal">
              {isMinting ? (
                <div className="modalContent">
                  <h2>Minting...</h2>
                </div>
              ) : (
                <div className="modalContent">
                  <h2>Mint Successful</h2>
                  <div className="modalBody">
                    <h3>{latestNFTMinted.name}</h3>
                    <Image
                      src={latestNFTMinted.image}
                      height="200"
                      width="200"
                      alt="latest minted nft"
                    />
                  </div>
                  <div className="modalFooter">
                    <button className="modalButton">
                      <a
                        href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${tokenData}`}
                        target="_blank"
                      >
                        View on OpenSea
                      </a>
                    </button>
                    <button className="modalButton">
                      <a
                        href={`https://mumbai.polygonscan.com/tx/${mintData.hash}`}
                        target="_blank"
                      >
                        View on Polygonscan
                      </a>
                    </button>
                    <button
                      onClick={() => setModalShow(false)}
                      className="modalButton"
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
  cursor: "pointer",
};
