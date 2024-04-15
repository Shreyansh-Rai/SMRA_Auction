import React, { useState, useEffect } from 'react';
import './loginUI.css'; // Import CSS file

function LoginUi() {
    const [showSpectrumDemand, setShowSpectrumDemand] = useState(false);
    const [showCompanyDetails, setShowCompanyDetails] = useState(true);

    // Dummy list of auction rules
    const auctionRules = [
        "Rule 1: Participants must be at least 18 years old.",
        "Rule 2: Bidding increments must be in multiples of $100.",
        "Rule 3: Winning bidders must pay within 24 hours of winning the auction."
        // Add more rules as needed
    ];
    const tabData = {
        'Tab 1': 3,
        'Tab 2': 3,
        'Tab 3': 2,
        'Tab 4': 4
    };

    const dummyDemandData = [
        80,  // Demand for Card 1
        90,  // Demand for Card 2
        75,  // Demand for Card 3
        // Add more demand data as needed
    ];

    const dummySupplyData = [
        70,  // Supply for Card 1
        60,  // Supply for Card 2
        85,  // Supply for Card 3
        // Add more supply data as needed
    ];

    const [activeTab, setActiveTab] = useState('Tab 1');
    const [timer, setTimer] = useState(0);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            setTimer(prevTimer => prevTimer + 1);
        }, 1000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, []); // Run this effect only once after initial render

    // Format the timer
    const formatTimer = (timeInSeconds) => {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const companyDetails = {
        name: "Company ABC",
        address: "123 Main Street, City, Country",
        phone: "123-456-7890",
        // Add more details as needed
    };

    // Dummy list of cards

    const demandData = [
        { cardName: "Card 1", supply: 70, demand: 80 },
        { cardName: "Card 2", supply: 60, demand: 90 },
        { cardName: "Card 3", supply: 85, demand: 75 },
        // Add more cards as needed
    ];
    const cardsData = [
        { name: "Card 1", region: "Region 1" },
        { name: "Card 2", region: "Region 2" },
        { name: "Card 3", region: "Region 3" },
        { name: "Card 3", region: "Region 3" },
        { name: "Card 3", region: "Region 3" },
        { name: "Card 3", region: "Region 3" },
        { name: "Card 3", region: "Region 3" },
        // Add more cards as needed
    ];

    return (
        <div className="container">
            <div className="left-half">
                <div className="leftnavbar">
                    <div className="navbar-section" onClick={() => { setShowSpectrumDemand(false); setShowCompanyDetails(true); }}>Company Portfolio</div>
                    <div className="navbar-section" onClick={() => { setShowSpectrumDemand(true); setShowCompanyDetails(false); }}>Spectrum Demand </div>
                </div>
                <div className='options'>


                    {showCompanyDetails && (
                        <div>
                            <h1>Past Holding</h1>

                            <div className="holdingcompany-cards">
                                    {cardsData.map((card, index) => (
                                        <div key={index} className="holding-card">
                                            <div className="card-content">
                                                <div className="card-left">
                                                    <div className="top-component">
                                                        <div className="lsaName">{card.name}</div>
                                                    </div>
                                                    <div className="bottom-component">
                                                        <div className="block-size">Block Size:</div>
                                                        <div className="quantity">Quantity Paired:</div>
                                                        <div className="quantity">Quantity Unpaired:</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                      
                    )}

                    {showSpectrumDemand && (
                        <div className="rules-section">
                            <h1>Round: 1</h1>
                            <div className="demandcard-grid">
                                {Array.from({ length: 16 }).map((_, index) => {
                                    const demand = dummyDemandData[index];
                                    const supply = dummySupplyData[index];
                                    const cardColor = supply < demand ? 'lightred' : supply > demand ? 'white' : '';

                                    return (
                                        <div key={index} className={`demandcard-box ${cardColor}`}>
                                            <div className="section">
                                                <div className="title">Card {index + 1}</div>
                                            </div>
                                            <div className="section">
                                                <div className="supply">Supply: {supply}</div>
                                            </div>
                                            <div className="section">
                                                <div className="demand">Demand: {demand}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    )}
                </div>


            </div>
            <div className="right-half">
                <div className="header-row">
                    <div className="header-box">
                        <div>
                            Round 1: <span className="green">Ongoing</span>
                        </div>
                    </div>
                    <div className="top-right-box">
                    <span className={`timer ${timer < 300 ? 'red-timer' : ''}`}>Clock: {formatTimer(timer)}</span>

                    </div>
                </div>
                <div className="ep">
                    <span className="ep-label">EP: 45690 </span>
                </div>

                <div className="middle-box">
                    <nav className="navbar">
                        {Object.keys(tabData).map(tab => (
                            <button
                                key={tab}
                                className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                onClick={() => handleTabClick(tab)}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    <div className="cards-container">
                        {Array.from({ length: tabData[activeTab] }).map((_, index) => (
                            <div key={index} className="card">
                                <div className="card-content">
                                    <div className="card-left">
                                        <div className="top-component">
                                            <div className="lsaName">{activeTab} Card {index + 1}</div>
                                            <button className="winner-button">Winner</button>
                                        </div>
                                        <div className="middle-component">
                                            <div className="block-size">Price: <span className='price'>2500</span></div>
                                            <div className="block-size">EP (per Block): <span className='price'>25</span></div>
                                        </div>
                        
                                        <div className="bottom-component">
                                            <div className="block-size">Block Size:</div>
                                            <div className="quantity">Quantity:</div>
                                        </div>
                                    </div>
                                    <div className="card-right">
                                        <div className="card-input-container">
                                            <span className="qty">Qty:</span> 
                                            <input type="number" id={`qty-input-${index + 1}`} placeholder="Enter number" className="card-input" />
                                        </div>
                                        <div className="button-container">
                                            <button className="lock-button">Lock</button>
                                            <button className="unlock-button">Unlock</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Content for the middle box */}
                </div>
                <button className="submit-button">Submit Round</button>
            </div>
        </div>
    );
}

export default LoginUi;
