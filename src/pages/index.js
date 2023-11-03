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
    <>
      <Head>
        <title>NFT Minter</title>
        <meta
          name="description"
          content="D_D Academy NFT Minter frontend integration project"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className="header">
        <h1>TierNFTs</h1>
        <ConnectButton />
      </header>
      {isUserConnected ? (
        <main className={styles.main}>
          <div className="NFTFlex">
            <div className="NFTCard">
              Tier 0
              <Image
                src="/nfts/0_basic.svg"
                width="200"
                height="200"
                alt="basic tier nft"
              />
              <button
                value="0.01"
                onClick={(e) => mintToken(e)}
                className="NFTMint"
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
            <div className="NFTCard">
              Tier 1
              <Image
                src="/nfts/1_medium.svg"
                width="200"
                height="200"
                alt="medium tier nft"
              />
              <button
                value="0.02"
                onClick={(e) => mintToken(e)}
                className="NFTMint"
                disabled={isMintLoading}
              >
                Mint
              </button>
            </div>
            <div className="NFTCard">
              Tier 2
              <Image
                src="/nfts/2_premium.svg"
                width="200"
                height="200"
                alt="premium tier nft"
              />
              <button
                value="0.05"
                onClick={(e) => mintToken(e)}
                className="NFTMint"
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
    </>
  );
}
