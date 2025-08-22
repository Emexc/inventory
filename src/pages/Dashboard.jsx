import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMenu,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiHome,
  FiPackage,
  FiLogOut,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import { useData } from "../context/context";

const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [currentItem, setCurrentItem] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [newItem, setNewItem] = useState({
    id: "",
    name: "",
    category: "",
    quantity: 0,
    price: 0,
    status: "In Stock",
    supplier: "",
    lastUpdated: new Date().toISOString().split("T")[0],
  });
  const [activeFilter, setActiveFilter] = useState("all");
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem("isAuthenticated"); // clear auth flag
    navigate("/"); // redirect without reloading the page
  };

  const { items } = useData();


  // Sample data initialization
  useEffect(() => {    

    setInventory(items);
    setFilteredInventory(items);

    // Extract unique categories
    const uniqueCategories = [
      ...new Set(items.map((item) => item.category)),
    ];
    setCategories(uniqueCategories);

    // Calculate initial stats
    calculateStatistics(items);
  }, []);

  // Calculate inventory statistics
  const calculateStatistics = (items) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );
    const inStock = items.filter((item) => item.status === "In Stock").length;
    const lowStock = items.filter((item) => item.status === "Low Stock").length;
    const outOfStock = items.filter(
      (item) => item.status === "Out of Stock"
    ).length;

    setStats({
      totalItems,
      totalValue,
      inStock,
      lowStock,
      outOfStock,
    });
  };

  // Filter inventory based on search term and active filter
  useEffect(() => {
    let filtered = inventory;

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((item) => item.status === activeFilter);
    }

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredInventory(filtered);
    calculateStatistics(filtered);
  }, [searchTerm, inventory, activeFilter]);

  // Sort inventory
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedItems = [...filteredInventory].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "asc" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === "asc" ? 1 : -1;
      }
      return 0;
    });

    setFilteredInventory(sortedItems);
  };

  // Add new item
  const handleAddItem = () => {
    const newId = Math.max(...inventory.map((item) => item.id), 0) + 1;
    const itemToAdd = {
      ...newItem,
      id: newId,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    // Update status based on quantity
    let status = "In Stock";
    if (itemToAdd.quantity === 0) {
      status = "Out of Stock";
    } else if (itemToAdd.quantity <= 5) {
      status = "Low Stock";
    }

    const updatedItem = { ...itemToAdd, status };

    const updatedInventory = [...inventory, updatedItem];
    setInventory(updatedInventory);

    // Add new category if it doesn't exist
    if (!categories.includes(updatedItem.category)) {
      setCategories([...categories, updatedItem.category]);
    }

    setIsAddModalOpen(false);
    setNewItem({
      id: "",
      name: "",
      category: "",
      quantity: 0,
      price: 0,
      status: "In Stock",
      supplier: "",
      lastUpdated: new Date().toISOString().split("T")[0],
    });
  };

  // Edit item
  const handleEditItem = () => {
    // Update status based on quantity
    let status = currentItem.status;
    if (currentItem.quantity === 0) {
      status = "Out of Stock";
    } else if (currentItem.quantity <= 5) {
      status = "Low Stock";
    } else {
      status = "In Stock";
    }

    const updatedItem = {
      ...currentItem,
      status,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    const updatedInventory = inventory.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );

    setInventory(updatedInventory);

    // Add new category if it doesn't exist
    if (!categories.includes(updatedItem.category)) {
      setCategories([...categories, updatedItem.category]);
    }

    setIsEditModalOpen(false);
  };

  // Delete item
  const handleDeleteItem = () => {
    const updatedInventory = inventory.filter(
      (item) => item.id !== itemToDelete
    );
    setInventory(updatedInventory);
    setIsDeleteModalOpen(false);
    setItemToDelete(null);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-yellow-100 text-yellow-800";
      case "Out of Stock":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = Object.keys(inventory[0]).join(",");
    const rows = inventory
      .map((item) =>
        Object.values(item)
          .map((value) =>
            typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          )
          .join(",")
      )
      .join("\n");

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "inventory_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <button
                className="md:hidden mr-4 text-gray-500"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
              <h1 className="text-xl font-bold text-blue-600">
                Inventory Manager
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search inventory..."
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FiSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
              <div className="relative group flex items-center space-x-2">
                {/* Badge with subtle glow and transition */}
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-200">
                  <FiUser size={16} className="opacity-90" />

                  {/* Admin crown indicator (small) */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg
                      width="8"
                      height="6"
                      viewBox="0 0 12 8"
                      fill="none"
                      className="text-yellow-800"
                    >
                      <path
                        d="M6 0L11.1962 7.5H0.803848L6 0Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>

                {/* Text with better typography */}
                <span className="hidden md:inline text-sm font-semibold text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-md transition-all duration-200 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar - Mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden mb-6 bg-white rounded-lg shadow p-4">
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-blue-600 font-medium rounded bg-blue-50"
                    >
                      <FiHome className="mr-2" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/product"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded"
                    >
                      <FiPackage className="mr-2" /> Products
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      to="/categories"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded"
                    >
                      <FiList className="mr-2" /> Categories
                    </Link>
                  </li> */}
                  {/* <li>
                    <Link
                      to="/reports"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded"
                    >
                      <FiPieChart className="mr-2" /> Reports
                    </Link>
                  </li> */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-left text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-colors duration-200"
                    >
                      <FiLogOut className="mr-2 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}

          {/* Sidebar - Desktop */}
          <div className="hidden md:block md:w-64 pr-6">
            <div className="bg-white rounded-lg shadow p-4 sticky top-6">
              <nav>
                <ul className="space-y-2">
                  <li>
                    <Link
                      to="/dashboard"
                      className="flex items-center px-4 py-2 text-blue-600 font-medium rounded bg-blue-50"
                    >
                      <FiHome className="mr-2" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/product"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded"
                    >
                      <FiPackage className="mr-2" /> Products
                    </Link>
                  </li>
                  {/* <li>
                    <Link
                      to="/categories"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded"
                    >
                      <FiList className="mr-2" /> Categories
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/reports"
                      className="flex items-center px-4 py-2 text-gray-600 hover:text-blue-600 rounded"
                    >
                      <FiPieChart className="mr-2" /> Reports
                    </Link>
                  </li> */}
                  <li>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2 text-left text-gray-600 hover:text-red-600 hover:bg-gray-50 rounded transition-colors duration-200"
                    >
                      <FiLogOut className="mr-2 flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 text-sm font-medium">
                  Total Items
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-1">
                  {stats.totalItems}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 text-sm font-medium">
                  Inventory Value
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  ${stats.totalValue.toFixed(2)}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 text-sm font-medium">
                  In Stock
                </div>
                <div className="text-2xl font-bold text-green-600 mt-1">
                  {stats.inStock}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="text-gray-500 text-sm font-medium">
                  Low/Out of Stock
                </div>
                <div className="text-2xl font-bold text-yellow-600 mt-1">
                  {stats.lowStock + stats.outOfStock}
                </div>
              </div>
            </div>

            {/* Inventory Table Section */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Inventory Items
                </h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <div className="flex items-center space-x-2">
                    <FiFilter className="text-gray-500" />
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="In Stock">In Stock</option>
                      <option value="Low Stock">Low Stock</option>
                      <option value="Out of Stock">Out of Stock</option>
                    </select>
                  </div>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center space-x-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg transition hover:bg-gray-50"
                  >
                    <FiDownload size={16} />
                    <span>Export</span>
                  </button>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <FiPlus size={16} />
                    <span>Add Item</span>
                  </button>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("name")}
                      >
                        <div className="flex items-center">
                          Name
                          {sortConfig.key === "name" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("category")}
                      >
                        <div className="flex items-center">
                          Category
                          {sortConfig.key === "category" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("quantity")}
                      >
                        <div className="flex items-center">
                          Qty
                          {sortConfig.key === "quantity" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("price")}
                      >
                        <div className="flex items-center">
                          Price
                          {sortConfig.key === "price" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                        onClick={() => requestSort("status")}
                      >
                        <div className="flex items-center">
                          Status
                          {sortConfig.key === "status" &&
                            (sortConfig.direction === "asc" ? (
                              <FiChevronUp className="ml-1" />
                            ) : (
                              <FiChevronDown className="ml-1" />
                            ))}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Last Updated
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInventory.length > 0 ? (
                      filteredInventory.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {item.supplier}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.category}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.quantity}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              ${item.price.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {item.lastUpdated}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => {
                                setCurrentItem(item);
                                setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                              title="Edit"
                            >
                              <FiEdit2 size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setItemToDelete(item.id);
                                setIsDeleteModalOpen(true);
                              }}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FiTrash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No items found matching your criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Add New Item
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem({ ...newItem, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.category}
                  onChange={(e) =>
                    setNewItem({ ...newItem, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="_new">+ Add New Category</option>
                </select>
                {newItem.category === "_new" && (
                  <input
                    type="text"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new category name"
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newItem.supplier}
                  onChange={(e) =>
                    setNewItem({ ...newItem, supplier: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={
                  !newItem.name ||
                  !newItem.category ||
                  newItem.quantity === undefined ||
                  newItem.price === undefined
                }
                className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium ${
                  !newItem.name ||
                  !newItem.category ||
                  newItem.quantity === undefined ||
                  newItem.price === undefined
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Item Modal */}
      {isEditModalOpen && currentItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Item</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name*
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentItem.name}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category*
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentItem.category}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                  <option value="_new">+ Add New Category</option>
                </select>
                {currentItem.category === "_new" && (
                  <input
                    type="text"
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new category name"
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        category: e.target.value,
                      })
                    }
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Supplier
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={currentItem.supplier}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, supplier: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity*
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={currentItem.quantity}
                    onChange={(e) =>
                      setCurrentItem({
                        ...currentItem,
                        quantity: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price*
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={currentItem.price}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="mt-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  {currentItem.quantity === 0
                    ? "Out of Stock"
                    : currentItem.quantity <= 5
                    ? "Low Stock"
                    : "In Stock"}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEditItem}
                disabled={
                  !currentItem.name ||
                  !currentItem.category ||
                  currentItem.quantity === undefined ||
                  currentItem.price === undefined
                }
                className={`px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium ${
                  !currentItem.name ||
                  !currentItem.category ||
                  currentItem.quantity === undefined ||
                  currentItem.price === undefined
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Confirm Deletion
              </h3>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete this item? This action cannot be
                undone.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteItem}
                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
