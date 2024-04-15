// CompanyAuction.js

import React, { useState, useEffect } from "react";
import Tab1 from './Tab1';
import '../Styles/CompanyAuction.css'
import { getDatabase, ref, get, set, onValue } from "firebase/database";
import { json, useParams } from 'react-router-dom';


const CompanyAuction = () => {
  const {companyName, auctionName} = useParams();
  const [currCompanyEliScore, setCurCompanyEliScore] = useState(0);
  const [curCompanyValuation, setCurCompanyValuation] = useState(0);
  const [curCompanyBankGuarantee, setCurCompanyBankGuarantee] = useState(0);
  const [itemsOnBid, setItemsOnBid] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [quantities, setQuantities] = useState([]);
  const [EP, setEP] = useState('');  // const [companyDetails, setCompanyDetails] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [winners, setWinners] = useState({});
  const [winQuantities, setWinQuantities] = useState({});
  const [winPrices, setWinPrices] = useState({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  const [roundSubmitted, setRoundSubmitted] = useState(false);
  const [round, setRound] = useState(0);

  // Fetch company portfolio data
  useEffect(() => {
    fetchCompanyPortfolio();
  }, [auctionName, companyName]); // Fetch on component mount and when auction or company name changes


  const companyDetails = {
    companyName: companyName,
    netWorth: curCompanyValuation,
    eligibilityScore: currCompanyEliScore,
    bankGuarantee: curCompanyBankGuarantee,
    currentHoldings: holdings.map(holding => ({
      operator: companyName,
      region: holding.region,
      holdingUP: holding.holdingUP,
      holdingP: holding.holdingP,
      year: holding.year,
      frequencyBand: holding.frequencyBand
    }))
  };

  const fetchCompanyPortfolio = () =>{
    const db = getDatabase();
    console.log(auctionName, companyName);
    const currentCompany = ref(db, `Auctions/${auctionName}/CompanyPortfolio/${companyName}`);
    onValue(currentCompany, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log(data);
        // console.log(data.Holding.holdingCards[0].region)
        setCurCompanyEliScore(data.totalEligibilityPoints);
        setCurCompanyValuation(data.valuation);
        setCurCompanyBankGuarantee(data.bankGuarantee);
        if (data && data.Holding && data.Holding.holdingCards){
          setHoldings(data.Holding.holdingCards);
        }
        
      } else {
        // Handle the case where data is null or empty
        console.log("Data is null or empty");
      }
    });
}


  const aja = () =>{
    fetchCompanyPortfolio();
    console.log(currCompanyEliScore);
    console.log(curCompanyBankGuarantee);
    console.log(curCompanyValuation);
    console.log(holdings);
  }

  function findWinner() {
    const db = getDatabase();
    if(round==0 || round==1){
      const currWinners = {}
      const currQuantities = {}
      const currPrices = {}
      itemsOnBid.forEach((item) => {
        const item_id = `${item.operator}-${item.frequencyBand}`
        currWinners[item_id] = 'false'
        currQuantities[item_id] = 0
        currPrices[item_id] = 'NA'
      })
      setWinners(currWinners)
      setWinQuantities(currQuantities)
      setWinPrices(currPrices)
      return
    }

    const refPath = `Auctions/${auctionName}/provisionalWinner/${round-1}/`;
    const itemsRef = ref(db, refPath);
    // const newCartItems = [];
    get((itemsRef)).then((snapshot) => {
      const data = snapshot.val();
      console.log("Received", data);
      const winners1 = data["winners"]
      const currWinners = {...winners}
      const currQuantities = {...winQuantities}
      const currPrices = {...winPrices}
      itemsOnBid.forEach((item) => {
        const item_id = `${item.operator}-${item.frequencyBand}`
        currWinners[item_id] = 'false'
        currQuantities[item_id] = 0
        currPrices[item_id] = 'NA'
      })
      setWinners(currWinners)
      setWinQuantities(currQuantities)
      setWinPrices(currPrices)

      itemsOnBid.forEach((item) => {
        const item_id = `${item.operator}-${item.frequencyBand}`
        // currWinners[item_id] = 'false'
        if (winners1[item_id] && winners1[item_id].length > 0) {
          winners1[item_id].forEach((item1) => {
            // if(item.airtel) console.log("Winner", item.airtel)
            for(let key in item1) {
              if(key == companyName){
                console.log(item_id, key, item1[key])
                currWinners[item_id] = 'true'
                currQuantities[item_id] = item1[key]
                setWinners(currWinners)
                setWinQuantities(currQuantities)
              }
              if(key=='price' && currWinners[item_id]=='true'){
                currPrices[item_id] = item1[key]
                setWinPrices(currPrices)
                console.log("PRICE", item1[key])
              }
            }
          });
        }
      })
      
      console.log("Winners" , winners)
    })
  }

  function calculateDemand() {
    const db = getDatabase();
    const refPath2 = `Auctions/${auctionName}/companyHistory`;
    const itemsRef2 = ref(db, refPath2);
    get((itemsRef2)).then((snapshot) => {
      const data = snapshot.val();
      const itemQuantities = {};
      if(round>1){
    data["companyMapping"]["airtel"][round-1].forEach((item) => {
      const itemId = `${item.operator}-${item.frequencyBand}`;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      itemQuantities[itemId] += item.qty;
    });
    data["companyMapping"]["rjio"][round-1].forEach((item) => {
      const itemId = `${item.operator}-${item.frequencyBand}`;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      itemQuantities[itemId] += item.qty;
    });
    data["companyMapping"]["bsnl"][round-1].forEach((item) => {
      const itemId = `${item.operator}-${item.frequencyBand}`;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      itemQuantities[itemId] += item.qty;
    });
    data["companyMapping"]["att"][round-1].forEach((item) => {
      const itemId = `${item.operator}-${item.frequencyBand}`;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      itemQuantities[itemId] += item.qty;
    });
    data["companyMapping"]["vi"][round-1].forEach((item) => {
      const itemId = `${item.operator}-${item.frequencyBand}`;
      if (!itemQuantities[itemId]) {
        itemQuantities[itemId] = 0;
      }
      itemQuantities[itemId] += item.qty;
    });
      // 
      // const rounditem = {
      //   round : round,
      //   data : newCartItems
      // }
      // data["companyMapping"]["airtel"].push(newCartItems);
      // data["companyMapping"]["rjio"].push(newCartItems);
      // data["companyMapping"]["att"].push(newCartItems);
      // data["companyMapping"]["bsnl"].push(newCartItems);
      // data["companyMapping"]["vi"].push(newCartItems);
      // console.log(data["companyMapping"]);
      console.log(itemQuantities);
      setQuantities(itemQuantities);    
  }
    })
  }


  useEffect(()=>{
    const db = getDatabase();
    const refPath= `Auctions/${auctionName}/CompanyPortfolio/${companyName}/totalEligibilityPoints`;
    const itemsRef = ref(db, refPath);
    get((itemsRef)).then((snapshot) => {
      const data = snapshot.val();
      var localep = JSON.parse(localStorage.getItem("EPVALUE"));
      if(localep==null && (data!=undefined || data !=null)){
        localStorage.setItem("EPVALUE", JSON.stringify(data))
        console.log("round ",round)
        setEP(data)
      }
      else{
        setEP(localep)
      }
      
    });
  },[]) 
  useEffect(() => {
    const db = getDatabase();
    const itemsRef = ref(db, `Auctions/${auctionName}/Items`);
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const newCartItems = [];
        Object.keys(data).forEach((freqBand) => {
          Object.keys(data[freqBand]).forEach((region) => {
            const newItem = {
              operator: region,
              frequencyBand: freqBand,
              unpaired: data[freqBand][region].unpairedBlocks,
              paired: data[freqBand][region].pairedBlocks,
              reservedPrice: data[freqBand][region].reservedPrice,
              epPerBlock: data[freqBand][region].epPerBlock,
              blockSize: data[freqBand][region].blockSize
            };
            newCartItems.push(newItem);
          });
        });
        setItemsOnBid(newCartItems);
      }
    });
  }, [round]); // Empty dependency array to run the effect only once on component mount
  

  const handleSubmitRound = () => {
    
    var localbidstates = JSON.parse(localStorage.getItem("BIDSTATESVALUE"))
    console.log("LOCALSTATES", localbidstates, winners, winPrices)
    var flag=0
    itemsOnBid.forEach((item) => {
        if(winners[`${item.operator}-${item.frequencyBand}`] == 'true' && 
            Number(item.reservedPrice)==Number(winPrices[`${item.operator}-${item.frequencyBand}`]) &&
            localbidstates[`${item.operator}-${item.frequencyBand}`]==true){
        alert("For item " + item.operator + item.frequencyBand+  " Please Select yes!")
        flag=1
        return;
      }
    })
    if(flag==1 ) return;

    console.log(purchases);
    console.log(companyName);
    console.log("check")
    const db = getDatabase();
    const refPath2 = `Auctions/${auctionName}/companyHistory`;
    const itemsRef2 = ref(db, refPath2);
    get((itemsRef2)).then((snapshot) => {
      const data = snapshot.val();
      console.log(data)
      console.log(data["companyMapping"][companyName][round]);
      for (let i = 0; i < data["companyMapping"][companyName][round].length; i++) {
        const freqBand = data["companyMapping"][companyName][round][i]["frequencyBand"];
        const region = data["companyMapping"][companyName][round][i]["operator"];
          for (let j = 0; j< purchases.length; j++) {
            if (purchases[j]["band"] === freqBand && purchases[j]["op"] === region) {
              data["companyMapping"][companyName][round][i]["qty"]=Number(purchases[j]["bid"]);
            }
          }
        }
      console.log(data["companyMapping"][companyName]); 
      // 
      // const rounditem = {
      //   round : round,
      //   data : newCartItems
      // }
      // data["companyMapping"]["airtel"].push(newCartItems);
      // data["companyMapping"]["rjio"].push(newCartItems);
      // data["companyMapping"]["att"].push(newCartItems);
      // data["companyMapping"]["bsnl"].push(newCartItems);
      // data["companyMapping"]["vi"].push(newCartItems);
      // console.log(data["companyMapping"]);

      
      const companyMapping = data["companyMapping"];
      set(ref(db, `Auctions/` + auctionName + `/companyHistory`), {
        companyMapping
      });


    })
    console.log("Round Submitted!");
    setRoundSubmitted(true);
  };

  const [activeTab, setActiveTab] = useState('tab1');

  const Tab = ({title, active, onClick}) => (
    <button 
      className={active ? 'tab active' : 'tab'}
      onClick={onClick}
    >
      {title}
    </button>
  );

  const Tab1Content = () => (
    <div className="portfolio-container">
      <h2 className="name">{companyDetails.companyName}</h2>
      <p className="name">Eligibility Points: {EP}</p>
      <p className="holding">Current Holdings:</p>
      <div className="contains-Tabcontent">
        {companyDetails.currentHoldings.map((holding, index) => (
          
          <div key={index} className="holding-container">
            <h3>{holding.frequencyBand}</h3>
            <p>region: {holding.region}</p>
            <p>holdingUP: {holding.holdingUP}</p>
            <p>holdingP: {holding.holdingP}</p>
          </div>
        ))}
      </div> 
    </div>
  );

  
  useEffect(() => {
  // This effect will run whenever the value of round changes
  console.log(round)
  setRoundSubmitted(false);
  calculateDemand();
  findWinner();
  findWinner();
  findWinner();
}, [round]);

  useEffect(()=>{
    const db = getDatabase();
    const itemsRef= ref(db, `Auctions/${auctionName}/timerData`);
    get((itemsRef)).then((snapshot) => { 
      const data = snapshot.val()
      // if(data.round == 1){
      //   localStorage.clear()
      // }
    })
  },[])
  useEffect(() => {
    const db = getDatabase();
    const itemsRef= ref(db, `Auctions/${auctionName}/timerData`);
    onValue(itemsRef, (snapshot) => {
      const data = snapshot.val();
      console.log(data);
      if(data){
        const intervalId = setInterval(() => {
          const startTime = data.start || 0;
          const currentTime = Date.now();
          const elapsedMilliseconds = currentTime - startTime;
          const remainingMilliseconds = Math.max(0, 60 * 1000 * data.time - elapsedMilliseconds);
          setElapsedTime(remainingMilliseconds);
          setRound(data.round);

          if (remainingMilliseconds > 0) {
            setTimerExpired(false);
            calculateDemand();
            // findWinner();
            // clearInterval(intervalId);
          }

          if (remainingMilliseconds === 0) {
            setTimerExpired(true);
            clearInterval(intervalId);
          }
      }, 1000)
      return () => {
        // Stop the interval when the component unmounts
        clearInterval(intervalId);
      };
    }
    })

    // Update the elapsed time when the data changes
    // const onDataChange = (snapshot) => {
    //   const startTime = snapshot.val()?.startTime || 0;
    //   const currentTime = Date.now();
    //   const newElapsedTime = currentTime - startTime;
    //   setElapsedTime(newElapsedTime);
    // };

    // timerDataRef.on('value', onDataChange);
    // return () => {
    //   // Stop listening to changes when the component unmounts
    //   timerDataRef.off('value', onDataChange);
    // };
  }, []); // Empty dependency array ensures this effect runs once

  const minutes = Math.floor(elapsedTime / 1000 / 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);

  useEffect(()=>{
    console.log(purchases)
    console.log(EP)
  },[purchases])
  const handlePurchase = (data)=>{
    setPurchases(data)
  }

  useEffect(()=>{
    // console.log("TERIYAKI ", EP)
  },[EP])
  const handleEP = (data) => {
    // console.log("GOT, ",data);
    setEP(data)
  }

          // console.log("this", itemsOnBid)
  return (
    <div style={{ display: "flex", justifyContent: "space-between"}}>
      <div className="mainleft">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          
          <div>
          <Tab1Content />
          </div>
        </div>
      </div>
      <div style={{ flex: 1, border: "1px solid #007bff", paddingLeft: "20px",
        paddingBottom:"20px", borderRadius:"10px", maxHeight:"95vh", marginTop:"1vh", marginRight:"1vh"}}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        </div><div style={{ display: "flex", alignItems: "center" }}>
          <pre className="name">        Timer              EP              Round</pre>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
        <div class="timer-box">
          <span id="minutes">{minutes}</span>:<span id="seconds">{seconds}</span>
        </div>
        <div class="timer-box">
          <span id="minutes">{EP}</span>
        </div>
        <div class="timer-box">
          <span id="minutes">{round}</span>
        </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
          <Tab1 round = {round} roundSubmitted = {roundSubmitted} timerStatus = {timerExpired} EP = {EP} onEP = {handleEP} onPurchase ={handlePurchase} items={itemsOnBid} quantities={quantities} winners={winners} winQuantities={winQuantities} winPrices={winPrices}/>
          {/* <Tab1 round = {round} roundSubmitted = {roundSubmitted} timerStatus = {timerExpired} EP = {EP} onEP = {handleEP} onPurchase ={handlePurchase} items={itemsOnBid} quantities={quantities}/> */}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <button disabled={timerExpired||roundSubmitted} onClick={handleSubmitRound}>Submit Round</button>
        </div>
      </div>
    </div>
  );
};

export default CompanyAuction;