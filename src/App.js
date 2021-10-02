import "./App.css";

import React, { useEffect, useState } from "react";
import { createGlobalState } from "react-hooks-global-state";
import Web3 from "web3";
import { devDAOABI, devDAOContractAddr } from "./shared/Constants";
const initialState = {
  tokenBal: 0,
  yourAddress: null,
  contractInstance: null,
  ethersProvider: null,
};
const { useGlobalState } = createGlobalState(initialState);

function getContract(web3) {
  return new web3.eth.Contract(devDAOABI, devDAOContractAddr);
}
async function requestAccount() {
  try {
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    return account;
  } catch (error) {
    console.error(error);
    alert("Login to Metamask first");
    return null;
  }
}
const Container = () => {
  const [tokenBal, setTokenBal] = useGlobalState("tokenBal");
  const [addr, setAddr] = useGlobalState("yourAddress");
  const [data, setData] = useState({});
  useEffect(() => {
    (async () => {
      try {
        if (typeof window.ethereum !== "undefined") {
          const account = await requestAccount();
          setAddr(() => account);
          if (!addr) {
            return;
          }
          const web3 = new Web3(Web3.givenProvider);
          const contract = getContract(web3);
          const balance = await contract.methods.balanceOf(account).call();
          setTokenBal(() => balance);
          for (let i = 0; i < balance - 0; i++) {
            const token = await contract.methods
              .tokenOfOwnerByIndex(account, i)
              .call();
            const tokenData = await contract.methods.tokenURI(token).call();
            setData((data) => {
              return { ...data, [token]: tokenData };
            });
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, [tokenBal, setTokenBal, addr, setAddr, data, setData]);

  return (
    <>
      <div className=" pb-1 container  mx-auto w-full h-full font-mono">
        <Header addr={addr}></Header>
        {(() => {
          if (typeof addr != "undefined") {
            return <Hero num={tokenBal} />;
          } else {
            return <div>Metamask not connected</div>;
          }
        })()}

        <div className="flex flex-wrap overflow-hidden xl:-mx-1">
          {Object.keys(data).map((id, index) => {
            const json = atob(data[id].substring(29));
            const result = JSON.parse(json);
            return (
              <div
                key={index}
                className="border-4 border-red-200 border-opacity-75 w-full mx-1 overflow-hidden sm:w-1/2 lg:w-1/4 mb-2 rounded-sm"
              >
                <img src={result.image} alt="" />
                <div className="text-center">{result.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const Hero = React.memo(({ num }) => {
  return (
    <div className="w-full container mx-auto p-6 bg-blue-200 mb-1">
      <h1 className="text-7xl w-1/2 xl:w-full xl:text-7xl font-black f-f-l">
        {num}
      </h1>

      <div className="text-2xl xl:w-full xl:text-2xl mt-2">
        DEVS are Owned by you
      </div>
    </div>
  );
});

const Header = React.memo(({ addr }) => {
  return (
    <div className="w-full container mx-auto pb-6 pt-6">
      <div className="w-full flex items-center justify-between">
        <div className="flex w-full sm:w-1/2 justify-start content-center ">
          <span className="font-bold text-xl">DEVDAO-TOKEN-OWNERS </span>
        </div>
        <div className="flex w-1/2 justify-end content-end ">{addr}</div>
      </div>
    </div>
  );
});

export default Container;
