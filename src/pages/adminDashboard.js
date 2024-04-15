import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AddItemModal from './AddItemModal';
import { getDatabase, ref, set, remove, get, onValue, update} from "firebase/database";


function AdminDashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [auctionName, setAuctionName] = useState('Default Auction Name');
  const [round, setRound] = useState(0); 
  const [demand, setDemand] = useState({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [timerExpired, setTimerExpired] = useState(false);
  
 


  const [airtelList, setAirtelList] = useState([]);
  const [rjioList, setRjioList] = useState([]);
  const [attList, setAttList] = useState([]);
  const [bsnlList, setBsnlList] = useState([]);
  const [viList, setViList] = useState([]);
  const location = useLocation();
  useEffect(() => {
    const db = getDatabase();
      const itemsRef = ref(db, `Auctions/${auctionName}/timerData`);
      get((itemsRef)).then((snapshot) => {
        const data = snapshot.val();
        if(data){
          const r = data["round"]
          setRound(r)
        }
        else{
          setRound(0)
        }
      })

    // const db = getDatabase();
  })

  useEffect(() => {
    getTimer()
  }, [round])

  function getTimer(){
    const db = getDatabase();
    const timeRef= ref(db, `Auctions/${auctionName}/timerData`);
    get((timeRef)).then((snapshot) => {
      const data = snapshot.val();
      // console.log(data);
      if(data){
        const intervalId = setInterval(() => {
          const startTime = data.start || 0;
          const currentTime = Date.now();
          const elapsedMilliseconds = currentTime - startTime;
          const remainingMilliseconds = Math.max(0, 60 * 1000 * data.time - elapsedMilliseconds);
          setElapsedTime(remainingMilliseconds);
          // setRound(data.round);

          if (remainingMilliseconds > 0) {
            setTimerExpired(false);
            // calculateDemand();
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
  }
  
  useEffect(() => {
    // Extract auctionName from the path parameters
    const { pathname } = location;
    const parts = pathname.split('/');
    const lastPart = parts[parts.length - 1];


    // Set auctionName to the last part of the path
    setAuctionName(lastPart || 'Default Auction Name');
  }, [location.pathname]);

  const openModal = () => {
    setIsModalOpen(true);
  };

 

  const minutes = Math.floor(elapsedTime / 1000 / 60);
  const seconds = Math.floor((elapsedTime / 1000) % 60);

  
  const updatePrice= () =>{
      const db = getDatabase();
      const itemsRef = ref(db, `Auctions/${auctionName}/Items`);
      console.log("Hello");
      get((itemsRef)).then((snapshot) => {
        const data = snapshot.val();
        console.log("Price Initial data",data)

        if (data) {
          const updatedData = {};

          Object.keys(data).forEach((freqBand) => {
            Object.keys(data[freqBand]).forEach((region) => {
              const currentReservedPrice = data[freqBand][region].reservedPrice;
              const paired = data[freqBand][region].pairedBlocks;
              const unpaired = data[freqBand][region].unpairedBlocks;

              const key = region + "-" + freqBand
              if(demand[key]>=Number(paired)+Number(unpaired)){
                const increasedReservedPrice = Math.round(Number(currentReservedPrice) * 1.1); // Increase by 10%
                // Update the reserved price in the updatedData object
                if (!updatedData[freqBand]) {
                  updatedData[freqBand] = {};
                }
  
                updatedData[freqBand][region] = {
                  ...data[freqBand][region],
                  reservedPrice: increasedReservedPrice,
                };
              }
              else{
                if (!updatedData[freqBand]) {
                  updatedData[freqBand] = {};
                }
                
                updatedData[freqBand][region] = {
                  ...data[freqBand][region],
                };
              }
            });
          });

          // Push the updated data back to the database
          console.log("Updated price:", updatedData);
          set(itemsRef, updatedData);
        }
      });
 }

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addItem = (item) => {
    setItems([...items, item]);
    closeModal();
  };
  const deleteAuction = () =>{
    console.log("Deleting Auction !")
    const db = getDatabase();
    remove(ref(db, `Auctions/${auctionName}`));
    console.log("Deleted Auction Successfully !");
  }

  const handleStartTimer = () => {
    const db = getDatabase();
    const startTime = Date.now();
    setRound(round + 1);
    console.log(round);
    set(ref(db, `Auctions/${auctionName}/timerData`), {
      start: startTime,
      time: 10,
      round: round+1
    });
    newRound();
  }

  const handleExtendTimer = () => {
    const db = getDatabase();
    const startTime = Date.now();
    console.log(round);
    set(ref(db, `Auctions/${auctionName}/timerData`), {
      start: startTime,
      time: 2,
      round: round
    });
  }



  const newRound = () => {
    const db = getDatabase();
    const refPath = `Auctions/${auctionName}/Items`;
    const itemsRef = ref(db, refPath);
    const newCartItems = [];
    get((itemsRef)).then((snapshot) => {
      const data = snapshot.val();
      Object.keys(data).forEach((freqBand) => {
        Object.keys(data[freqBand]).forEach((region) => {
          const newItem = {
            operator: region,
            frequencyBand: freqBand,
            blockSize:  data[freqBand][region].blockSize,
            unpaired: data[freqBand][region].unpairedBlocks,
            paired: data[freqBand][region].pairedBlocks,
            reservedPrice: data[freqBand][region].reservedPrice,
            epPerBlock: data[freqBand][region].epPerBlock,
            qty: 0
          };
          newCartItems.push(newItem);
        });
      });
    })
    const refPath2 = `Auctions/${auctionName}/companyHistory`;
    const itemsRef2 = ref(db, refPath2);
    get((itemsRef2)).then((snapshot) => {
      const data = snapshot.val();
      data["companyMapping"]["airtel"][round+1] = newCartItems;
      data["companyMapping"]["rjio"][round+1] = newCartItems;
      data["companyMapping"]["att"][round+1] = newCartItems;
      data["companyMapping"]["bsnl"][round+1] = newCartItems;
      data["companyMapping"]["vi"][round+1] = newCartItems;
      console.log(data["companyMapping"]);
      const companyMapping = data["companyMapping"]
      set(ref(db, `Auctions/${auctionName}/companyHistory`), {
        companyMapping
      });
    })
  }

// ----------------------- Result Calculation -------------------------------------

const publishResult = () => {
  const db = getDatabase();
  console.log(round);
  const companyRefs = ['airtel', 'rjio', 'vi', 'att', 'bsnl'].map(company => {
      return ref(db, `Auctions/${auctionName}/companyHistory/companyMapping/${company}/${round}/`);
  });

  // Fetch data for each company from Firebase and update state
  Promise.all(companyRefs.map(ref => {
      return new Promise((resolve, reject) => {
          onValue(ref, (snapshot) => {
              const data = snapshot.val();
              if (data) {
                  resolve(data);
              } else {
                  reject(new Error(`${ref} data is null or empty`));
              }
          });
      });
  })).then((results) => {
      // Update state for each company
      const companyStateSetters = {
          'airtel': setAirtelList,
          'rjio': setRjioList,
          'vi': setViList,
          'att': setAttList,
          'bsnl': setBsnlList
      };

      results.forEach((data, index) => {
          const company = ['airtel', 'rjio', 'vi', 'att', 'bsnl'][index];
          companyStateSetters[company](data);
      });

      // Further processing...
      console.log(airtelList);
      console.log(viList);
      console.log(bsnlList);
      console.log(attList);
      console.log(rjioList);

      const matrix = {};
      const totalAvailable = {};
      const price = {};

      airtelList.forEach((item) => {
          const key = item.operator + "-" + item.frequencyBand;
          if (!matrix[key]) {
              matrix[key] = [];
              totalAvailable[key] = Number(item.unpaired) + Number(item.paired);
              price[key] = Number(item.reservedPrice)
          }
          matrix[key].push({ company: 'airtel', quantity: item.qty });
      });

      viList.forEach((item) => {
          const key = item.operator + "-" + item.frequencyBand;
          if (!matrix[key]) {
              matrix[key] = [];
              totalAvailable[key] = Number(item.unpaired) + Number(item.paired);
              price[key] = Number(item.reservedPrice)
          }
          matrix[key].push({ company: 'vi', quantity: item.qty });
      });

      attList.forEach((item) => {
          const key = item.operator + "-" + item.frequencyBand;
          if (!matrix[key]) {
              matrix[key] = [];
              totalAvailable[key] = Number(item.unpaired) + Number(item.paired);
              price[key] = Number(item.reservedPrice)
          }
          matrix[key].push({ company: 'att', quantity: item.qty });
      });

      bsnlList.forEach((item) => {
          const key = item.operator + "-" + item.frequencyBand;
          if (!matrix[key]) {
              matrix[key] = [];
              totalAvailable[key] = Number(item.unpaired) + Number(item.paired);
              price[key] = Number(item.reservedPrice)
          }
          matrix[key].push({ company: 'bsnl', quantity: item.qty });
      });

      rjioList.forEach((item) => {
        const key = item.operator + "-" + item.frequencyBand;
        if (!matrix[key]) {
            matrix[key] = [];
            totalAvailable[key] = Number(item.unpaired) + Number(item.paired);
            price[key] = Number(item.reservedPrice)
        }
        matrix[key].push({ company: 'rjio', quantity: item.qty });
    });

      console.log(matrix);
      console.log(totalAvailable);

      // Sort bids for each item in descending order based on quantity
      Object.keys(matrix).forEach((key) => {
          matrix[key].sort((a, b) => b.quantity - a.quantity);
      });

      // Select bids until the sum of quantities reaches the available quantity for each item
      const winners = {};
      const demand1 = {};
      Object.keys(matrix).forEach((key) => {
          const available = totalAvailable[key];
          console.log(available);
          let sum = 0;
          winners[key] = [];
          demand1[key]=0;
          matrix[key].forEach((bid) => {
              demand1[key]+=bid.quantity;
              if (sum + bid.quantity <= available && bid.quantity > 0) {
                  winners[key].push({ [bid.company]: bid.quantity });
                  sum += bid.quantity;
                  winners[key].push({ "price": price[key] });
                  console.log("price", price[key])
              }
          });
         
          setDemand(demand1);
      });


      console.log(winners);
      set(ref(db, `Auctions/${auctionName}/provisionalWinner/${round}/`), {
        winners,
      });

  }).catch(error => {
      console.error(error);
  });

}


function calculateDemand() {
  const db = getDatabase();
  const refPath2 = `Auctions/${auctionName}/companyHistory`;
  const itemsRef2 = ref(db, refPath2);
  get((itemsRef2)).then((snapshot) => {
    const data = snapshot.val();
    const itemQuantities = {};
    const itemAvailable = {};
    const priceOfEachItem = {};
    if(round>1){
  data["companyMapping"]["airtel"][round-1].forEach((item) => {
    const itemId = `${item.operator}-${item.frequencyBand}`;
    if (!itemQuantities[itemId]) {
      itemQuantities[itemId] = 0;
      itemAvailable[itemId] = 0;
    }
    itemQuantities[itemId] += item.qty;
    itemAvailable[itemId] = item.unpairedBlocks + item.pairedBlocks;
    priceOfEachItem[itemId] = item.reservedPrice
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
    if(itemQuantities[itemId] > itemAvailable[itemId]){
      priceOfEachItem[itemId] += 0.1*priceOfEachItem[itemId];
    }
    
  });
    
    console.log(itemQuantities);
    console.log(itemAvailable);
    set(ref(db, `Auctions/${auctionName}/DemandAndPrice/${round-1}/`), {
      itemQuantities,
      priceOfEachItem,
    });

    // setQuantities(itemQuantities);    
}
  })
}


 






  const handleInit = () => {
    InitCompanyHistory();
    
  }
  
  const handleDelete = () => {
    const db = getDatabase();
    const refPath = `Auctions/${auctionName}/companyHistory`;
    const companyMapping = {
      'rjio': [],
      'airtel': [],
      'vi': [],
      'att': [],
      'bsnl': []
    };

    
    set(ref(db, refPath), {
      companyMapping
    });
    console.log("History removed");
  }

  const resetRound = () => {
    const db = getDatabase();
    set(ref(db, `Auctions/${auctionName}/timerData`), {
      start: Date.now(),
      time: 1,
      round: 0
    });
  }

  const InitCompanyHistory = () => {
    const db = getDatabase();
    const startTime = Date.now();
    const companyMapping = {
      'rjio': [{"0" : "INIT"}],
      'airtel': [{"0" : "INIT"}],
      'vi': [{"0" : "INIT"}],
      'att': [{"0" : "INIT"}],
      'bsnl': [{"0" : "INIT"}]
    };
    const refPath = `Auctions/${auctionName}/companyHistory`;
    const itemsRef = ref(db, refPath);
    get((itemsRef)).then((snapshot) => {
      const data = snapshot.val();
      if (!data) {
        console.log("init...done!")
        set(ref(db, refPath), {
          companyMapping
        });
      }
      else {
        console.log("Already set");
      }
    })
  };

  return (
    <div className="admin-dashboard">
      <h2>Auction Instance: {auctionName}</h2>
      {/* <button onClick={deleteAuction} style={{ position: 'fixed', top: '10%', right: '20px', transform: 'translateY(-50%)' }}>Delete Auction</button> */}
      <button onClick={handleStartTimer} style={{ marginLeft: '50px' }}>Start Timer</button>
      <button onClick={handleExtendTimer} style={{ marginLeft: '50px' }}>Extend Timer</button>
      <button onClick={openModal} style={{ marginLeft: '50px' }}>Add Item</button>
      <button onClick={handleInit} style={{marginLeft:'50px'}}>Init Company History</button>
      <button onClick={handleDelete} style={{marginLeft:'50px'}}>Delete Company History</button>
      <button onClick={publishResult} style={{marginLeft:'50px'}}>UpdateAfterRound</button>
      <button onClick={updatePrice} style={{marginLeft:'50px'}}>UpdatePrice</button>
      <span class="timer-box">
          <span id="minutes">{minutes}</span>:<span id="seconds">{seconds}</span>
      </span>
      {/* <button onClick={calcWithNewPrice} style={{marginLeft:'50px'}}>WithNewPrice</button> */}
      {/* <button onClick={calc} style={{marginLeft:'50px'}}>Provisional Winner</button> */}

      {isModalOpen && <AddItemModal onAdd={addItem} onCancel={closeModal} auctionName={auctionName}/>}
      
    </div>
  );
}

export default AdminDashboard;
