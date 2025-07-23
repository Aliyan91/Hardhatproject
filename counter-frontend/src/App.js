import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import counterABI from "./CounterABI.json";
import "./App.css";

// Replace with your deployed contract address
const CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Helper to convert BigNumber timestamp to readable format
const formatTimestamp = (timestamp) => {
  try {
    const ts = parseInt(timestamp.toString()) * 1000;
    return new Date(ts).toLocaleString();
  } catch (e) {
    return "Invalid Date";
  }
};

function App() {
  const [count, setCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [contract, setContract] = useState(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("");

  const connectWallet = async () => {
    if (window.ethereum && !connecting) {
      setConnecting(true);
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        setConnected(true);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        const bal = await provider.getBalance(address);
        setBalance(ethers.formatEther(bal));
        const counterContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          counterABI.abi,
          signer
        );
        setContract(counterContract);

        // Set initial count
        counterContract.getCount().then((value) => setCount(Number(value)));

        // Listen to events
        counterContract.on("Increment", (by, newValue, timestamp) => {
          setEvents((prev) => [
            {
              type: "Increment",
              by,
              newValue: newValue.toString(),
              timestamp,
            },
            ...prev,
          ]);
          setCount(Number(newValue));
        });

        counterContract.on("Decrement", (by, newValue, timestamp) => {
          setEvents((prev) => [
            {
              type: "Decrement",
              by,
              newValue: newValue.toString(),
              timestamp,
            },
            ...prev,
          ]);
          setCount(Number(newValue));
        });

        counterContract.on("Reset", (by, timestamp) => {
          setEvents((prev) => [{ type: "Reset", by, timestamp }, ...prev]);
          setCount(0);
        });
      } catch (err) {
        setError(err.reason || err.message || "Transaction failed");
      }
      setConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setConnected(false);
    setAccount("");
    setBalance("");
    setContract(null);
    setEvents([]);
    setCount(0);
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setConnected(true);
          connectWallet();
        }
      });
    }

    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("chainChanged", () => {
          window.location.reload();
        });
        window.ethereum.removeListener("accountsChanged", () => {
          window.location.reload();
        });
      }

      if (contract) {
        contract.removeAllListeners();
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleIncrement = async () => {
    setError("");
    if (contract) {
      try {
        await contract.increment();
      } catch (err) {
        setError(err.reason || err.message || "Transaction failed");
      }
    }
  };

  const handleDecrement = async () => {
    setError("");
    if (contract) {
      try {
        await contract.decrement();
      } catch (err) {
        setError(err.reason || err.message || "Transaction failed");
      }
    }
  };

  const handleReset = async () => {
    setError("");
    if (contract) {
      try {
        await contract.reset();
      } catch (err) {
        setError(err.reason || err.message || "Transaction failed");
      }
    }
  };

  if (!connected) {
    return (
      <div className="app-container">
        <div className="sidebar">
          <h2>Counter DApp</h2>
          <button
            className="connect-btn"
            onClick={connectWallet}
            disabled={connecting}
          >
            Connect Wallet
          </button>
        </div>
        <div className="main-content">
          <h1>Welcome!</h1>
          <p>Please connect your wallet to use the Counter DApp.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>Counter DApp</h2>
        <div className="account-info">
          <div>
            <strong>Account:</strong>
            <br />{" "}
            <span className="mono">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
          <div>
            <strong>Balance:</strong>
            <br />{" "}
            <span className="mono">{Number(balance).toFixed(4)} ETH</span>
          </div>
        </div>
        <button className="disconnect-btn" onClick={disconnectWallet}>
          Disconnect
        </button>
      </div>
      <div className="main-content">
        <h1>Counter</h1>
        <div className="counter-box">
          <span className="count">{count}</span>
          {error && <div className="error-msg">{error}</div>}
          <div className="button-row">
            <button className="action-btn increment" onClick={handleIncrement}>
              Increment
            </button>
            <button
              className="action-btn decrement"
              onClick={handleDecrement}
              disabled={count === 0}
            >
              Decrement
            </button>
            <button className="action-btn reset" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>
        <div className="events-section">
          <h3>Events</h3>
          <ul className="events-list">
            {events.map((event, idx) => (
              <li
                key={idx}
                className={`event-item ${event.type.toLowerCase()}`}
              >
                <span className="event-type">{event.type}</span> by{" "}
                <span className="mono">
                  {event.by.slice(0, 6)}...{event.by.slice(-4)}
                </span>
                {event.newValue !== undefined ? (
                  <span>
                    , new value: <span className="mono">{event.newValue}</span>
                  </span>
                ) : (
                  ""
                )}
                {event.timestamp !== undefined ? (
                  <span>
                    , time:{" "}
                    <span className="mono">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </span>
                ) : (
                  ""
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
