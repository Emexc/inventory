// DataContext.js
import React, { createContext, useState, useContext } from "react";

// 1. Create the context
const DataContext = createContext();

// 2. Provider component
export const DataProvider = ({ children }) => {
  const [items, setItems] = useState([
        {
          id: 1,
          name: 'MacBook Pro 16"',
          category: "Electronics",
          quantity: 15,
          price: 2499.99,
          status: "In Stock",
          supplier: "Apple Inc.",
          lastUpdated: "2023-05-15",
        },
        {
          id: 2,
          name: "Ergonomic Office Chair",
          category: "Furniture",
          quantity: 8,
          price: 349.99,
          status: "Low Stock",
          supplier: "Office Comfort",
          lastUpdated: "2023-06-20",
        },
        {
          id: 3,
          name: '4K Monitor 27"',
          category: "Electronics",
          quantity: 12,
          price: 399.99,
          status: "In Stock",
          supplier: "Dell Technologies",
          lastUpdated: "2023-07-10",
        },
        {
          id: 4,
          name: "Mechanical Keyboard",
          category: "Electronics",
          quantity: 25,
          price: 129.99,
          status: "In Stock",
          supplier: "Keychron",
          lastUpdated: "2023-07-25",
        },
        {
          id: 5,
          name: "Wireless Mouse",
          category: "Electronics",
          quantity: 0,
          price: 59.99,
          status: "Out of Stock",
          supplier: "Logitech",
          lastUpdated: "2023-08-01",
        },
        {
          id: 6,
          name: "Desk Lamp",
          category: "Office Supplies",
          quantity: 7,
          price: 45.99,
          status: "Low Stock",
          supplier: "IKEA",
          lastUpdated: "2023-06-15",
        },
      ]);

  return (
    <DataContext.Provider value={{ items, setItems }}>
      {children}
    </DataContext.Provider>
  );
};

// 3. Custom hook for easy access
export const useData = () => useContext(DataContext);
