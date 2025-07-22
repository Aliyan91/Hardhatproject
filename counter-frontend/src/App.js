import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import counterABI from "./CounterABI.json";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

function App() {
  const [count, setCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    let counterContract;
    provider.send("eth_requestAccounts", []).then(async () => {
      const signer = await provider.getSigner();
      counterContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        counterABI.abi,
        signer
      );
      setContract(counterContract);
      counterContract.getCount().then(setCount);
      // Listen to events
      counterContract.on("Increment", (by, newValue) => {
        setEvents((prev) => [
          { type: "Increment", by, newValue: newValue.toString() },
          ...prev,
        ]);
        setCount(Number(newValue));
      });
      counterContract.on("Decrement", (by, newValue) => {
        setEvents((prev) => [
          { type: "Decrement", by, newValue: newValue.toString() },
          ...prev,
        ]);
        setCount(Number(newValue));
      });
      counterContract.on("Reset", (by) => {
        setEvents((prev) => [{ type: "Reset", by }, ...prev]);
        setCount(0);
      });
    });
    return () => {
      if (counterContract) {
        counterContract.removeAllListeners();
      }
    };
  }, []);

  const handleIncrement = async () => {
    if (contract) {
      await contract.increment();
    }
  };
  const handleDecrement = async () => {
    if (contract) {
      await contract.decrement();
    }
  };
  const handleReset = async () => {
    if (contract) {
      await contract.reset();
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Counter DApp</h1>
      <h2>Count: {count}</h2>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleDecrement} style={{ marginLeft: 8 }}>
        Decrement
      </button>
      <button onClick={handleReset} style={{ marginLeft: 8 }}>
        Reset
      </button>
      <h3>Events</h3>
      <ul>
        {events.map((event, idx) => (
          <li key={idx}>
            {event.type} by {event.by}
            {event.newValue !== undefined
              ? `, new value: ${event.newValue}`
              : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
