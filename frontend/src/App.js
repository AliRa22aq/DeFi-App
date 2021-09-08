import './App.css';
import React, { useEffect, useState } from "react"
import Web3 from "web3";
const MYToeknABI = require('./abis/MyToken.json')
const FarmTokenABI = require('./abis/FarmToken.json')



function App() {


  const [data, setData] = useState({
    userAddress: "",
    farmtokenAddress: "",
    userBalance: { MyTokens: 0, FarmTokens: 0 },
    farmTokenBalance: { MyTokens: 0, FarmTokens: 0 },
    myTokenContract: null,
    farmTokenContract: null,
    loading: false,
    allownce: 0,
    transfered: false
  });


  window.ethereum.on('accountsChanged', function (accounts) {
    setData(pre => { return { ...pre, userAddress: accounts[0] } })
  })

  // console.log("data", data)


  const loadWeb3 = async () => {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
      console.log(window.web3.currentProvider.isMetaMask)

      // Get current logged in user address
      const accounts = await window.web3.eth.getAccounts()
      setData(pre => { return { ...pre, userAddress: accounts[0] } })
      console.log(accounts[0])

    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  };




  const loadBlockchainData = async () => {

    // const web3 = new Web3("https://ropsten.infura.io/v3/92a3eada72834b629e28ff80ba4af4d0");
    // Initial web3 instance with current provider which is ethereum in our case
    const web3 = new Web3(window.ethereum);

    // Detect which Ethereum network the user is connected to
    let networkId = await web3.eth.net.getId()
    const myTokenData = MYToeknABI.networks[networkId]
    const farmTokenData = FarmTokenABI.networks[networkId]
    setData(pre => { return { ...pre, farmtokenAddress: farmTokenData.address } })


    console.log(myTokenData, farmTokenData)

    setData(pre => { return { ...pre, loading: true } })

    // Load Contract Data
    const myTokenContract = new web3.eth.Contract(MYToeknABI.abi, myTokenData.address)
    const farmTokenContract = new web3.eth.Contract(FarmTokenABI.abi, farmTokenData.address)
    console.log(myTokenContract, farmTokenContract)

    setData(pre => { return { ...pre, myTokenContract, farmTokenContract } })

    const accounts = await window.web3.eth.getAccounts()

    // Verify accounts[0] and farmToken balance of MyToken before and after the transfer
    const balanceMyTokenBeforeAccounts0 = await myTokenContract.methods.balanceOf(accounts[0]).call()
    const userMytokenbalance = web3.utils.fromWei(balanceMyTokenBeforeAccounts0.toString(), "ether")
    console.log("user has MTKN ", userMytokenbalance)

    const balanceMyTokenBeforeFarmToken = await myTokenContract.methods.balanceOf(farmTokenData.address).call()
    const farmMytokenbalance = web3.utils.fromWei(balanceMyTokenBeforeFarmToken.toString(), "ether")
    console.log("Farm has MTKN ", farmMytokenbalance)

    const balanceMyTokenAfterAccounts0 = await farmTokenContract.methods.balanceOf(accounts[0]).call()
    const userFarmtokenbalance = web3.utils.fromWei(balanceMyTokenAfterAccounts0.toString(), "ether")
    console.log("user has FTKN ", userFarmtokenbalance)

    const balanceMyTokenAfterFarmToken = await farmTokenContract.methods.balanceOf(farmTokenData.address).call()
    const farmFarmtokenbalance = web3.utils.fromWei(balanceMyTokenAfterFarmToken.toString(), "ether")
    console.log("Farm has FTKN ", farmFarmtokenbalance)

    const newUserBalance = {
      MyTokens: userMytokenbalance,
      FarmTokens: userFarmtokenbalance
    }

    const newFarmTokenBalance = {
      MyTokens: farmMytokenbalance,
      FarmTokens: farmFarmtokenbalance
    }

    console.log(newUserBalance, newFarmTokenBalance)


    setData(pre => { return { ...pre, userBalance: newUserBalance, farmTokenBalance: newFarmTokenBalance } })

    console.log(data)


    // // Validate that the farmToken can now move x amount of MyToken on our behalf
    const allowanceAfter = await myTokenContract.methods.allowance(accounts[0], farmTokenData.address).call()
    const allownce = web3.utils.fromWei(allowanceAfter.toString(), "ether")
    console.log(allownce)

    setData(pre => { return { ...pre, allownce: allownce } })

    setData(pre => { return { ...pre, loading: false } })

  };



  const approve = async () => {

    const web3 = new Web3(window.ethereum);

    const arrpved = await data.myTokenContract.methods.approve(data.farmtokenAddress, web3.utils.toWei("10", "ether")).send({ from: data.userAddress })
      .on("confirmation", (confirmationNumber, receipt) => {
        alert("Approval successful")
        console.log(confirmationNumber)
        console.log(receipt)
      })


    // // Validate that the farmToken can now move x amount of MyToken on our behalf
    const allowanceAfter = await data.myTokenContract.methods.allowance(data.userAddress, data.farmtokenAddress).call()
    const allownce = web3.utils.fromWei(allowanceAfter.toString(), "ether")
    setData(pre => { return { ...pre, allownce: allownce } })

  }


  const refuse = async () => {

    const web3 = new Web3(window.ethereum);

    const refuse = await data.myTokenContract.methods.approve(data.farmtokenAddress, web3.utils.toWei("0", "ether")).send({ from: data.userAddress })
      .on("confirmation", (confirmationNumber, receipt) => {
        alert("Refusal successful")
        console.log(confirmationNumber)
        console.log(receipt)
      })


    // // Validate that the farmToken can now move x amount of MyToken on our behalf
    const allowanceAfter = await data.myTokenContract.methods.allowance(data.userAddress, data.farmtokenAddress).call()
    const allownce = web3.utils.fromWei(allowanceAfter.toString(), "ether")
    setData(pre => { return { ...pre, allownce: allownce } })

  }


  const transfer = async () => {

    const web3 = new Web3(window.ethereum);
    const deposite = await data.farmTokenContract.methods.deposit(web3.utils.toWei("10", "ether")).send({ from: data.userAddress })
      .on("confirmation", (confirmationNumber, receipt) => {
        alert("Deposite successful")
        console.log(confirmationNumber)
        console.log(receipt)
        setData(pre => { return { ...pre, transfered: true } })
      })
  }


  const withDraw = async () => {

    const web3 = new Web3(window.ethereum);

    const withdraw = await data.farmTokenContract.methods.withdraw(web3.utils.toWei("5", "ether")).send({ from: data.userAddress })
      .on("confirmation", (confirmationNumber, receipt) => {
        alert("Withdraw successful")
        console.log(confirmationNumber)
        console.log(receipt)
        setData(pre => { return { ...pre, transfered: true } })
      })
  }


  useEffect(() => {
    loadWeb3()
  }, [])

  useEffect(() => {
    if (data.userAddress) {
      loadBlockchainData()
    }
  }, [data.userAddress, data.transfered])


  if (data.loading) return <div>Loading . . . </div>

  return (
    <div className="App">
      <h2> Let's DeFi </h2>

      <br />
      {
        data.userAddress ?
          <div>You are login with Address: {data.userAddress}</div> :
          <>
            <div>Please Signin to Metamask</div>
            <br />
            <button onClick={() => loadWeb3()}> Connect </button>
          </>
      }

      <br />

      <div>
        User's Balance: <b>{data.userBalance.MyTokens}</b> MTKN  <b>{data.userBalance.FarmTokens}</b> FTKN
      </div>

      <br />


      <div>
        Farm's Balance:  <b>{data.farmTokenBalance.MyTokens}</b> MTKN {/* <b>{data.farmTokenBalance.FarmTokens}</b> FTKN */}
      </div>

      <br />
      <br />
      <br />
      <div>

        {
          data.allownce > 0 ?
            <div>
              Refuse <b>10</b> MyTokens to deposite in Farm
              <br />
              <button onClick={refuse}> Refuse </button>
            </div> :
            <div>
              Approve <b>10</b> MyTokens to deposite in Farm
              <br />
              <button onClick={approve}> Approve </button>
            </div>
        }
        
      </div>

      < br />

      <div>
        you have <b>{data.allownce}</b> MyTokens Approved to deposite in Farm
        <br />
        <button disabled={data.allownce > 0 ? false : true} onClick={transfer}> Deposite </button>
      </div>

      < br />

      {
        data.farmTokenBalance.MyTokens ?
          <div>
            withdraw <b>5</b> MyTokens from Farm
            <br />
            <button disabled={data.farmTokenBalance.MyTokens > 0 ? false : true} onClick={withDraw}> Withdraw </button>
          </div> : null
      }

    </div>
  );
}

export default App;
