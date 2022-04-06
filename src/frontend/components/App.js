import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { useState } from "react";
import { ethers } from "ethers";
import Loader from "./atoms/Loader";

import MarketplaceAbi from "../contractsData/Marketplace.json";
import MarketplaceAdress from "../contractsData/Marketplace-address.json";
import NFTAbi from "../contractsData/NFT.json";
import NFTAddress from "../contractsData/NFT-address.json";

import Navbar from "./atoms/Navbar";
import Home from "./pages/Home";
import Create from "./pages/Create";
import MyListed from "./pages/MyListedItems";
import MyPurchases from "./pages/MyPurchases";

function App() {
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState(null);
  const [nft, setNft] = useState({});
  const [marketplace, setMarketplace] = useState({});

  const web3Handler = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccount(accounts[0]);
    // Get Provider from Metamask
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // Set signer
    const signer = provider.getSigner();

    loadContracts(signer);
  };

  const loadContracts = async (signer) => {
    // Get deployed contracts
    const marketplace = await new ethers.Contract(
      MarketplaceAdress.address,
      MarketplaceAbi.abi,
      signer
    );
    setMarketplace(marketplace);
    const nft = await new ethers.Contract(
      NFTAddress.address,
      NFTAbi.abi,
      signer
    );
    setNft(nft);
    setLoading(false);
  };

  return (
    <BrowserRouter>
      <div className="App">
        <Navbar web3Handler={web3Handler} account={account} />
        {loading ? (
          <Loader text={"Awaiting Metamask Connection..."} />
        ) : (
          <Routes>
            <Route
              path="/"
              element={<Home marketplace={marketplace} nft={nft} />}
            />
            <Route path="/create" element={<Create marketplace={marketplace} nft={nft}/>} />
            <Route path="/my-listed-items" element={<MyListed />} />
            <Route path="/my-purchases" element={<MyPurchases />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
